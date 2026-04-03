import { Link, useLocation } from "react-router-dom";
import {
   LayoutDashboard,
   Users,
   PawPrint,
   CreditCard,
   Bell,
   Package,
   ShoppingCart,
   CalendarClock,
} from "lucide-react";
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNeko } from "@/hooks/useNeko";
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
   title: string;
   href: string;
   icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
   { title: "Dashboard", href: "/", icon: LayoutDashboard },
   { title: "Clientes", href: "/clientes", icon: Users },
   { title: "Mascotas", href: "/mascotas", icon: PawPrint },
   { title: "Productos", href: "/productos", icon: Package },
   { title: "Ventas", href: "/ventas", icon: ShoppingCart },
   { title: "Pagos", href: "/pagos", icon: CreditCard },
   { title: "Turnos", href: "/turnos", icon: CalendarClock },
   { title: "Recordatorios", href: "/recordatorios", icon: Bell },
];

export function AppSidebar() {
   const location = useLocation();
   const { isActive, toggle } = useNeko();

   return (
      <Sidebar>
         <SidebarHeader>
            <div className='flex items-center gap-2 px-2 py-1'>
               <PawPrint className='h-6 w-6 text-primary' />
               <span className='text-md font-bold'>Clínica Para Mascotas</span>
            </div>
         </SidebarHeader>

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Navegación</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                           <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                 <Link to={item.href}>
                                    <Icon />
                                    <span>{item.title}</span>
                                 </Link>
                              </SidebarMenuButton>
                           </SidebarMenuItem>
                        );
                     })}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>

         <SidebarFooter>
            <Tooltip>
               <TooltipTrigger asChild>
                  <button
                     onClick={toggle}
                     className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  >
                     <span className='text-base leading-none'>{isActive ? "🐱" : "😺"}</span>
                     <span>{isActive ? "Despedir a Gina" : "Llamar a Gina"}</span>
                     
                  </button>
               </TooltipTrigger>
               <TooltipContent side='top' className='max-w-52 text-center'>
                  {isActive
                     ? "Hacé clic sobre Gina para cambiar su comportamiento: puede seguirte, huir de vos, caminar sola o perseguir una pelota."
                     : "¡Llamá a Gina para que aparezca en pantalla!"}
               </TooltipContent>
            </Tooltip>
         </SidebarFooter>
      </Sidebar>
   );
}
