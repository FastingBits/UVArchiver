-- Tablas básicas
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Nuevas Tablas
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS acciones (
    id_accion SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS rol_acciones (
    id_rol INT NOT NULL,
    id_accion INT NOT NULL,
    PRIMARY KEY (id_rol, id_accion),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_accion) REFERENCES acciones(id_accion) ON DELETE CASCADE
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    pertenece_a_institucion SMALLINT NOT NULL DEFAULT 1 CHECK (pertenece_a_institucion IN (0, 1)),
    id_rol INT NOT NULL DEFAULT 2,
    id_departamento INT NOT NULL,
    two_fa_secret VARCHAR(255) DEFAULT NULL,
    two_fa_enabled SMALLINT DEFAULT 0 CHECK (two_fa_enabled IN (0, 1)),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
);

CREATE TABLE IF NOT EXISTS codigos_recuperacion_usuarios (
      id SERIAL PRIMARY KEY,
      id_usuario INT NOT NULL,
      codigo VARCHAR(255) NOT NULL,
      usado SMALLINT DEFAULT 0 CHECK (usado IN (0, 1)),
      usado_en TIMESTAMP DEFAULT NULL,
      expira_en TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
    id_documento SERIAL PRIMARY KEY,
    id_departamento INT NOT NULL,
    id_usuario INT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    subido_por VARCHAR(150) NOT NULL,
    privado SMALLINT NOT NULL DEFAULT 1 CHECK (privado IN (0, 1)),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

INSERT INTO departamentos (nombre, descripcion) VALUES
('Sin Departamento', 'No asignado')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO roles (id_rol, nombre) VALUES 
(1, 'system_admin'),
(2, 'admin'), 
(3, 'user'), 
(4, 'auditor')
ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO acciones (id_accion, nombre, descripcion) VALUES 
(1,'read_department','Mostrar los departamentos'),
(2,'add_department', 'Agregar departamento'),
(3,'edit_department', 'Editar departamento'),
(4,'delete_department', 'Eliminar departamento'),
(5,'read_action','Mostrar las acciones'),
(6,'add_action', 'Agregar accion'),
(7,'edit_action', 'Editar accion'),
(8,'delete_action', 'Eliminar accion'),
(9,'read_role','Mostrar los roles'),
(10,'add_role', 'Agregar rol'),
(11,'edit_role', 'Editar rol'),
(12,'delete_role', 'Eliminar rol'),
(13,'read_user','Mostrar los usuarios'),
(14,'add_user', 'Agregar usuario'),
(15,'edit_user', 'Editar usuario'),
(16,'delete_user', 'Eliminar usuario'),
(17,'read_document','Mostrar los documentos'),
(18,'download_document','Descargar documento'),
(19,'add_document', 'Agregar documento'),
(20,'edit_document', 'Editar documento'),
(21,'delete_document', 'Eliminar documento'),
(22,'read_role_action','Mostrar las acciones de los roles'),
(23,'add_role_action', 'Agregar rol accion'),
(24,'edit_role_action', 'Editar rol accion'),
(25,'delete_role_action', 'Eliminar rol accion')
ON CONFLICT (id_accion) DO NOTHING;

INSERT INTO rol_acciones (id_rol, id_accion) VALUES 
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(2, 13), 
(2, 14),
(2, 15),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(3, 17),
(3, 18),
(3, 19),
(3, 20),
(3, 21),
(4, 17)
ON CONFLICT DO NOTHING;



INSERT INTO departamentos (nombre, descripcion) VALUES
('Administracion', 'Departamento de administracion'),
('Finanzas', 'Departamento de finanzas'),
('Recursos Humanos', 'Departamento de recursos humanos'),
('Tecnologia', 'Departamento de tecnologia'),
('Direccion', 'Departamento de direccion'),
('Investigacion y Desarrollo', 'Departamento de investigacion y desarrollo'),
('Juridico', 'Departamento de juridico'),
('Contabilidad', 'Departamento de contabilidad')
ON CONFLICT (nombre) DO NOTHING;


--ANTES DE CONTINUAR INGRESE AL SISTEMA CON EL USUARIO CREADO EN LA SEMILLA
--CREE AL MENOS 4 USUARIOS DIFERENTES Y ASIGNELES UN DEPARTAMENTO Y UN ROL


INSERT INTO documentos (id_documento, id_departamento, id_usuario, nombre, direccion, subido_por, privado, fecha_creacion, fecha_ultima_actualizacion, deleted_at) VALUES
(1, 5, NULL, 'doc1', 'doc1.pdf', 'user1', 1, '2026-05-25 12:15:22', '2026-05-10 08:59:47', NULL),
(2, 2, NULL, 'doc2', 'doc2.xlxs', 'user1', 1, '2026-05-25 12:15:22', '2026-05-10 08:59:47', NULL),
(3, 3, NULL, 'doc3', 'doc3.docx', 'user2', 1, '2026-05-25 12:15:22', '2026-05-10 08:59:47', NULL),
(4, 4, NULL, 'doc4', 'doc4.pdf', 'user4', 1, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(5, 5, NULL, 'doc5', 'doc5.pdf', 'user3', 0, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(6, 6, NULL, 'doc6', 'doc6.pptx', 'user3', 0, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(7, 2, NULL, 'doc7', 'doc7.pdf', 'user2', 1, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(8, 4, NULL, 'doc8', 'doc8.doc', 'user5', 1, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(9, 3, NULL, 'doc9', 'doc9.pdf', 'user3', 1, '2026-06-10 08:59:47', '2026-06-10 08:59:47', NULL),
(10, 2, NULL, 'doc10', 'doc10.pdf', 'user2', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(11, 6, NULL, 'doc11', 'doc11.pdf', 'user1', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(12, 2, NULL, 'doc12', 'doc12.pdf', 'user2', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(13, 3, NULL, 'doc13', 'doc13.pptx', 'user3', 0, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(14, 7, NULL, 'doc14', 'doc14.pdf', 'user1', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(15, 2, NULL, 'doc15', 'doc15.pdf', 'user2', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(16, 3, NULL, 'doc16', 'doc16.docx', 'user3', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(17, 8, NULL, 'doc17', 'doc17.pdf', 'user1', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(18, 2, NULL, 'doc18', 'doc18.pdf', 'user2', 0, '2026-07-10 08:59:47', '2026-06-10 08:59:47', NULL),
(19, 3, NULL, 'doc19', 'doc19.docx', 'user3', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(20, 9, NULL, 'doc20', 'doc20.pdf', 'user1', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(21, 2, NULL, 'doc21', 'doc21.pdf', 'user2', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(22, 7, NULL, 'doc22', 'doc22.pdf', 'user1', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(23, 2, NULL, 'doc23', 'doc23.xlxs', 'user2', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(24, 5, NULL, 'doc24', 'doc24.pdf', 'user1', 1, NOW(), NOW(), NULL),
(25, 2, NULL, 'doc25', 'doc25.pdf', 'user2', 1, NOW(), NOW(), NULL)
ON CONFLICT (id_documento) DO UPDATE
SET id_departamento = EXCLUDED.id_departamento,
    id_usuario = EXCLUDED.id_usuario,
    nombre = EXCLUDED.nombre,
    direccion = EXCLUDED.direccion,
    subido_por = EXCLUDED.subido_por,
    privado = EXCLUDED.privado,
    fecha_creacion = EXCLUDED.fecha_creacion,
    fecha_ultima_actualizacion = EXCLUDED.fecha_ultima_actualizacion,
    deleted_at = EXCLUDED.deleted_at;

-- Sincronización obligatoria de secuencias tras inserts manuales
SELECT setval(pg_get_serial_sequence('roles', 'id_rol'), COALESCE((SELECT MAX(id_rol) FROM roles), 1));
SELECT setval(pg_get_serial_sequence('acciones', 'id_accion'), COALESCE((SELECT MAX(id_accion) FROM acciones), 1));
SELECT setval(pg_get_serial_sequence('departamentos', 'id_departamento'), COALESCE((SELECT MAX(id_departamento) FROM departamentos), 1));
SELECT setval(pg_get_serial_sequence('documentos', 'id_documento'), COALESCE((SELECT MAX(id_documento) FROM documentos), 1));
