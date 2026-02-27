-- =============================================
-- VeteVite - Schema de Base de Datos Supabase
-- =============================================
-- Fecha: 2026-02-02
-- Descripción: Schema completo para sistema de gestión veterinaria
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: clientes
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  direccion TEXT,
  dni_cuit VARCHAR(20),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  saldo_pendiente INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_apellido ON clientes(apellido);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);

-- =============================================
-- TABLA: mascotas
-- =============================================
CREATE TABLE mascotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raza VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  edad VARCHAR(20),
  sexo VARCHAR(10) CHECK (sexo IN ('Macho', 'Hembra')),
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Fallecido')),
  otras_caracteristicas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mascotas_cliente_id ON mascotas(cliente_id);
CREATE INDEX idx_mascotas_nombre ON mascotas(nombre);
CREATE INDEX idx_mascotas_estado ON mascotas(estado);

-- =============================================
-- TABLA: historia_clinica
-- =============================================
CREATE TABLE historia_clinica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  motivo_consulta TEXT NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NOT NULL,
  peso DECIMAL(6,2),
  temperatura DECIMAL(4,2),
  vacunas_aplicadas TEXT[], -- Array de strings
  notas TEXT,
  veterinario VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_historia_clinica_mascota_id ON historia_clinica(mascota_id);
CREATE INDEX idx_historia_clinica_fecha ON historia_clinica(fecha DESC);

-- =============================================
-- TABLA: pagos_parciales
-- =============================================
-- Nota: Esta tabla va ANTES de items_pago porque items_pago la referencia
CREATE TABLE pagos_parciales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monto INTEGER NOT NULL CHECK (monto > 0),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: items_pago
-- =============================================
CREATE TABLE items_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  historia_clinica_id UUID REFERENCES historia_clinica(id) ON DELETE SET NULL,
  descripcion VARCHAR(500) NOT NULL,
  monto INTEGER NOT NULL CHECK (monto > 0),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado Parcial', 'Pagado')),
  monto_pagado INTEGER DEFAULT 0 CHECK (monto_pagado >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_items_pago_cliente_id ON items_pago(cliente_id);
CREATE INDEX idx_items_pago_estado ON items_pago(estado);
CREATE INDEX idx_items_pago_fecha ON items_pago(fecha DESC);

-- =============================================
-- TABLA: items_pago_pagos_parciales (tabla pivote)
-- =============================================
-- Relación many-to-many entre items_pago y pagos_parciales
CREATE TABLE items_pago_pagos_parciales (
  item_pago_id UUID NOT NULL REFERENCES items_pago(id) ON DELETE CASCADE,
  pago_parcial_id UUID NOT NULL REFERENCES pagos_parciales(id) ON DELETE CASCADE,
  PRIMARY KEY (item_pago_id, pago_parcial_id)
);

-- =============================================
-- TABLA: recordatorios
-- =============================================
CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historia_clinica_id UUID REFERENCES historia_clinica(id) ON DELETE SET NULL,
  mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE NOT NULL,
  es_recurrente BOOLEAN DEFAULT FALSE,
  frecuencia_recurrencia VARCHAR(50) CHECK (frecuencia_recurrencia IN ('Mensual', 'Anual', 'Personalizado')),
  intervalo_personalizado INTEGER,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Completado', 'Reprogramado', 'Cancelado')),
  creado_por VARCHAR(255),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_original TIMESTAMP WITH TIME ZONE,
  notas_reprogramacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recordatorios_mascota_id ON recordatorios(mascota_id);
CREATE INDEX idx_recordatorios_cliente_id ON recordatorios(cliente_id);
CREATE INDEX idx_recordatorios_fecha ON recordatorios(fecha_recordatorio);
CREATE INDEX idx_recordatorios_estado ON recordatorios(estado);

-- =============================================
-- TRIGGERS: updated_at automático
-- =============================================
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mascotas_updated_at BEFORE UPDATE ON mascotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historia_clinica_updated_at BEFORE UPDATE ON historia_clinica
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_pago_updated_at BEFORE UPDATE ON items_pago
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordatorios_updated_at BEFORE UPDATE ON recordatorios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCIÓN: Actualizar saldo_pendiente del cliente
-- =============================================
CREATE OR REPLACE FUNCTION actualizar_saldo_pendiente_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular el saldo pendiente del cliente
  UPDATE clientes
  SET saldo_pendiente = (
    SELECT COALESCE(SUM(monto - monto_pagado), 0)
    FROM items_pago
    WHERE cliente_id = NEW.cliente_id
      AND estado != 'Pagado'
  )
  WHERE id = NEW.cliente_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar saldo cuando cambian items de pago
CREATE TRIGGER trigger_actualizar_saldo_cliente
AFTER INSERT OR UPDATE OR DELETE ON items_pago
FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_pendiente_cliente();

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista: Mascotas con información del dueño
CREATE OR REPLACE VIEW mascotas_con_cliente AS
SELECT
  m.*,
  c.nombre AS cliente_nombre,
  c.apellido AS cliente_apellido,
  c.telefono AS cliente_telefono,
  c.email AS cliente_email
FROM mascotas m
JOIN clientes c ON m.cliente_id = c.id;

-- Vista: Recordatorios próximos (7 días)
CREATE OR REPLACE VIEW recordatorios_proximos AS
SELECT
  r.*,
  m.nombre AS mascota_nombre,
  c.nombre AS cliente_nombre,
  c.apellido AS cliente_apellido,
  c.telefono AS cliente_telefono
FROM recordatorios r
JOIN mascotas m ON r.mascota_id = m.id
JOIN clientes c ON r.cliente_id = c.id
WHERE r.estado = 'Pendiente'
  AND r.fecha_recordatorio BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY r.fecha_recordatorio ASC;

-- Vista: Clientes con saldo pendiente
CREATE OR REPLACE VIEW clientes_con_saldo AS
SELECT
  c.*,
  COUNT(DISTINCT m.id) AS total_mascotas,
  COUNT(DISTINCT ip.id) AS total_items_pendientes
FROM clientes c
LEFT JOIN mascotas m ON c.id = m.cliente_id
LEFT JOIN items_pago ip ON c.id = ip.cliente_id AND ip.estado != 'Pagado'
WHERE c.saldo_pendiente > 0
GROUP BY c.id
ORDER BY c.saldo_pendiente DESC;

-- =============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- =============================================
COMMENT ON TABLE clientes IS 'Tabla de clientes/dueños de mascotas';
COMMENT ON TABLE mascotas IS 'Tabla de mascotas asociadas a clientes';
COMMENT ON TABLE historia_clinica IS 'Registro de consultas veterinarias';
COMMENT ON TABLE items_pago IS 'Items de pago/deuda de clientes';
COMMENT ON TABLE pagos_parciales IS 'Pagos parciales realizados';
COMMENT ON TABLE recordatorios IS 'Recordatorios de seguimiento';

COMMENT ON COLUMN clientes.saldo_pendiente IS 'Calculado automáticamente por trigger';
COMMENT ON COLUMN items_pago.estado IS 'Pendiente | Pagado Parcial | Pagado';
COMMENT ON COLUMN recordatorios.estado IS 'Pendiente | Completado | Reprogramado | Cancelado';

-- =============================================
-- FIN DEL SCHEMA
-- =============================================
