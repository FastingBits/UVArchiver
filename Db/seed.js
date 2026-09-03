const { pool } = require('../config/db.js');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        const user = {
            nombre: 'system',
            apellido_paterno: 'admin',
            apellido_materno: 'system',
            correo: 'systemadmin@uv.mx',
            contrasena: '123456789',
            id_rol: 1,
            id_departamento: 1,
            pertenece_a_institucion: 1
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.contrasena, salt);
        user.contrasena = hash;

        const query = `
            INSERT INTO usuarios (
                nombre, apellido_paterno, apellido_materno, correo, contrasena, pertenece_a_institucion, id_rol, id_departamento
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (correo) DO UPDATE SET
                nombre = EXCLUDED.nombre,
                apellido_paterno = EXCLUDED.apellido_paterno,
                apellido_materno = EXCLUDED.apellido_materno,
                contrasena = EXCLUDED.contrasena,
                pertenece_a_institucion = EXCLUDED.pertenece_a_institucion,
                id_rol = EXCLUDED.id_rol,
                id_departamento = EXCLUDED.id_departamento
            RETURNING id_usuario
        `;
        const result = await pool.query(query, [
            user.nombre,
            user.apellido_paterno,
            user.apellido_materno,
            user.correo,
            user.contrasena,
            user.pertenece_a_institucion,
            user.id_rol,
            user.id_departamento
        ]);

        const idUsuario = result.rows[0].id_usuario;
        const checkUser = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [idUsuario]);
        console.log('Usuario sembrado exitosamente:');
        console.log(JSON.stringify(checkUser.rows[0], null, 2));
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar seed:', error);
        await pool.end();
        process.exit(1);
    }
}

main();