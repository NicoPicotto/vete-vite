import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PawPrint, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const recoverySchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmá la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RecoveryForm = z.infer<typeof recoverySchema>;

export default function LoginView() {
  const { session, loading, passwordRecovery, signIn, updatePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const recoveryForm = useForm<RecoveryForm>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!loading && session && !passwordRecovery) {
    return <Navigate to='/' replace />;
  }

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
    } catch {
      toast.error('Email o contraseña incorrectos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecovery = async (data: RecoveryForm) => {
    setIsSubmitting(true);
    try {
      await updatePassword(data.password);
      toast.success('Contraseña actualizada correctamente');
    } catch {
      toast.error('No se pudo actualizar la contraseña. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Ingresá tu email primero');
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success('Te enviamos un email para restablecer tu contraseña');
      setForgotMode(false);
    } catch {
      toast.error('No se pudo enviar el email. Verificá la dirección ingresada.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col items-center gap-2 mb-8'>
          <div className='flex items-center justify-center h-12 w-12 rounded-full bg-primary/10'>
            <PawPrint className='h-6 w-6 text-primary' />
          </div>
          <h1 className='text-xl font-bold'>Clínica Para Mascotas</h1>
        </div>

        {passwordRecovery ? (
          <Card>
            <CardHeader>
              <CardTitle>Nueva contraseña</CardTitle>
              <CardDescription>Ingresá tu nueva contraseña para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={recoveryForm.handleSubmit(handleRecovery)} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='new-password'>Nueva contraseña</Label>
                  <div className='relative'>
                    <Input
                      id='new-password'
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder='Mínimo 8 caracteres'
                      {...recoveryForm.register('password')}
                    />
                    <button
                      type='button'
                      onClick={() => setShowNewPassword((v) => !v)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    >
                      {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  {recoveryForm.formState.errors.password && (
                    <p className='text-sm text-destructive'>{recoveryForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='confirm-password'>Confirmar contraseña</Label>
                  <Input
                    id='confirm-password'
                    type='password'
                    placeholder='Repetí la nueva contraseña'
                    {...recoveryForm.register('confirmPassword')}
                  />
                  {recoveryForm.formState.errors.confirmPassword && (
                    <p className='text-sm text-destructive'>
                      {recoveryForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type='submit' className='w-full' disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : forgotMode ? (
          <Card>
            <CardHeader>
              <CardTitle>Recuperar contraseña</CardTitle>
              <CardDescription>
                Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='forgot-email'>Email</Label>
                  <Input
                    id='forgot-email'
                    type='email'
                    placeholder='tu@email.com'
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                  />
                </div>
                <Button onClick={handleForgotPassword} className='w-full' disabled={forgotLoading}>
                  {forgotLoading ? 'Enviando...' : 'Enviar email'}
                </Button>
                <button
                  type='button'
                  onClick={() => setForgotMode(false)}
                  className='text-sm text-muted-foreground hover:text-foreground text-center'
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Ingresá con tu email y contraseña.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='tu@email.com'
                    autoComplete='email'
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className='text-sm text-destructive'>{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Tu contraseña'
                      autoComplete='current-password'
                      {...loginForm.register('password')}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className='text-sm text-destructive'>{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type='submit' className='w-full' disabled={isSubmitting}>
                  {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>

                <button
                  type='button'
                  onClick={() => {
                    setForgotEmail(loginForm.getValues('email'));
                    setForgotMode(true);
                  }}
                  className='text-sm text-muted-foreground hover:text-foreground text-center'
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
