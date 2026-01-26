# VeteVite - Sistema de Gestión Veterinaria

Sistema de gestión integral para clínicas veterinarias desarrollado con React, Vite, TypeScript y shadcn/ui.

## Stack Tecnológico

- **React 19** + **Vite 7**
- **TypeScript 5.9**
- **shadcn/ui** (Radix UI + Tailwind CSS 4)
- **React Router v6**
- **React Hook Form + Zod** (validaciones)
- **date-fns** (manejo de fechas)
- **Sonner** (notificaciones)

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Documentación del Proyecto

Ver [CLAUDE.md](./CLAUDE.md) para:
- Scope completo del proyecto
- Estructura de datos
- Fases de desarrollo
- Roadmap y features

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── ui/           # shadcn components
│   ├── clientes/     # Componentes de clientes
│   ├── mascotas/     # Componentes de mascotas
│   ├── historia/     # Historia clínica
│   └── layout/       # Layout y navegación
├── views/            # Páginas principales
├── lib/              # Utilidades y types
├── hooks/            # Custom hooks
└── context/          # React Context
```

## Estado Actual

**Fase 1 completada** ✅
- Setup base y estructura de carpetas
- React Router configurado
- Sidebar navigation con shadcn/ui
- Types y mock data definidos

**Próximo**: Fase 2 - CRUD de Clientes y Mascotas

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
