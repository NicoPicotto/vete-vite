# Clinica Para Mascotas — Sistema de Gestión Veterinaria

Sistema de gestión integral para clínicas veterinarias. Permite administrar clientes, mascotas, historia clínica, turnos, recordatorios, pagos, stock y ventas desde una interfaz unificada.

Desarrollado por **Nicolás Picoto**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 7 |
| Lenguaje | TypeScript 5.9 |
| UI | shadcn/ui · Radix UI · Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Storage) |
| Estado del servidor | TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Routing | React Router v6 |
| Notificaciones | Sonner |

---

## Módulos

- **Clientes** — CRUD con saldo pendiente calculado automáticamente
- **Mascotas** — CRUD con historia clínica, vacunas y desparasitaciones por mascota
- **Historia Clínica** — Consultas con archivos adjuntos (PDF/imagen) y recordatorios integrados
- **Turnos** — Agenda con slots de 30 min, estados y generación de historia clínica desde el turno
- **Recordatorios** — Seguimiento de pacientes con atajos de fecha y reprogramación
- **Pagos** — Items de cobro con pagos parciales y saldo por cliente
- **Ventas** — Carrito de productos con descuento de stock automático e integración con pagos
- **Productos** — Inventario con stock ideal y alertas de reposición
- **Dashboard** — Métricas del día: recordatorios próximos y turnos de hoy

---

## Estructura

```
src/
├── components/
│   ├── ui/               # shadcn/ui
│   ├── clientes/
│   ├── mascotas/
│   ├── historia/
│   ├── turnos/
│   ├── recordatorios/
│   ├── pagos/
│   ├── productos/
│   ├── ventas/
│   ├── vacunas/
│   └── layout/
├── views/
│   ├── DashboardView/
│   ├── ClientesView/
│   ├── MascotasView/
│   ├── TurnosView/
│   ├── RecordatoriosView/
│   ├── PagosView/
│   ├── ProductosView/
│   └── VentasView/
├── services/             # Capa de datos (Supabase)
├── hooks/                # TanStack Query hooks
└── lib/                  # Types, schemas, router, utils
```
