CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS acciones (
    id_accion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rol_acciones (
    id_rol INT NOT NULL,
    id_accion INT NOT NULL,
    PRIMARY KEY (id_rol, id_accion),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_accion) REFERENCES acciones(id_accion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    pertenece_a_institucion TINYINT(1) NOT NULL DEFAULT 1,
    id_rol INT NOT NULL DEFAULT 4,
    id_departamento INT NOT NULL DEFAULT 1,
    two_fa_secret VARCHAR(255) DEFAULT NULL,
    two_fa_enabled TINYINT(1) DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE codigos_recuperacion_usuarios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      id_usuario INT NOT NULL,
      codigo VARCHAR(255) NOT NULL,
      usado TINYINT DEFAULT 0,
      usado_en DATETIME NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    id_usuario INT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    subido_por VARCHAR(150) NOT NULL,
    privado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO departamentos (nombre, descripcion) VALUES
('Sin Departamento', 'No asignado');

INSERT INTO roles (id_rol, nombre) VALUES 
(1, 'system_admin'),
(2, 'admin'), 
(3, 'user'), 
(4, 'auditor');


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
(25,'delete_role_action', 'Eliminar rol accion');

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
(4, 17);

INSERT INTO departamentos (nombre, descripcion) VALUES
('Administracion', 'Departamento de administracion'),
('Finanzas', 'Departamento de finanzas'),
('Recursos Humanos', 'Departamento de recursos humanos'),
('Tecnologia', 'Departamento de tecnologia'),
('Direccion', 'Departamento de direccion'),
('Investigacion y Desarrollo', 'Departamento de investigacion y desarrollo'),
('Juridico', 'Departamento de juridico'),
('Contabilidad', 'Departamento de contabilidad');

--ANTES DE CONTINUAR INGRESE AL SISTEMA CON EL USUARIO CREADO EN LA SEMILLA
--CREE AL MENOS 4 USUARIOS DIFERENTES Y ASIGNELES UN DEPARTAMENTO Y UN ROL

INSERT INTO documentos (id_documento, id_departamento, id_usuario, nombre , direccion , subido_por, privado , fecha_creacion , fecha_ultima_actualizacion , deleted_at) VALUES
(1,5,1,'doc1','doc1.pdf','user1', 1 ,'2026-05-25 12:15:22','2026-05-10 08:59:47',NULL),
(2,2,1,'doc2','doc2.xlxs','user1', 1 ,'2026-05-25 12:15:22','2026-05-10 08:59:47',NULL),
(3,3,2,'doc3','doc3.docx','user2', 1 ,'2026-05-25 12:15:22','2026-05-10 08:59:47',NULL),
(4,4,4,'doc4','doc4.pdf','user4', 1 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(5,5,3,'doc5','doc5.pdf','user3', 0 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(6,6,3,'doc6','doc6.pptx','user3', 0 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(7,2,2,'doc7','doc7.pdf','user2', 1 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(8,4,5,'doc8','doc8.doc','user5', 1 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(9,3,3,'doc9','doc9.pdf','user3', 1 ,'2026-06-10 08:59:47','2026-06-10 08:59:47',NULL),
(10,2,2,'doc10','doc10.pdf','user2', 1 ,'2026-07-10 08:59:47','2026-07-10 08:59:47',NULL),
(11,6,1,'doc11','doc11.pdf','user1', 1 ,'2026-07-10 08:59:47','2026-07-10 08:59:47',NULL),
(12,2,2,'doc12','doc12.pdf','user2', 1 ,'2026-07-10 08:59:47','2026-07-10 08:59:47',NULL),
(13,3,3, 'doc13', 'doc13.pptx', 'user3', 0, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(14,7,1, 'doc14', 'doc14.pdf', 'user1', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(15,2,2, 'doc15', 'doc15.pdf', 'user2', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(16,3,3, 'doc16', 'doc16.docx', 'user3', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(17,8,1, 'doc17', 'doc17.pdf', 'user1', 1, '2026-07-10 08:59:47', '2026-07-10 08:59:47', NULL),
(18,2,2, 'doc18', 'doc18.pdf', 'user2', 0, '2026-07-10 08:59:47', '2026-06-10 08:59:47', NULL),
(19,3,3, 'doc19', 'doc19.docx', 'user3', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(20,9,1, 'doc20', 'doc20.pdf', 'user1', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(21,2,2, 'doc21', 'doc21.pdf', 'user2', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(22,7,1, 'doc22', 'doc22.pdf', 'user1', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(23,2,2, 'doc23', 'doc23.xlxs', 'user2', 1, '2026-08-10 08:59:47', '2026-08-10 08:59:47', NULL),
(24,5,1, 'doc24', 'doc24.pdf', 'user1', 1, NOW(), NOW(), NULL),
(25,2,2, 'doc25', 'doc25.pdf', 'user2', NOW(), NOW(), NULL);