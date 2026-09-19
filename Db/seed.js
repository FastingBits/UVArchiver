const { pool } = require('../config/db.js');
const mysqlAuthRepository = require('../repositories/mysql/auth.repository.js');
const pgAuthRepository = require('../repositories/pg/auth.repository.js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
    try {
        const user = {
            nombre: 'System',
            apellido_paterno: 'Admin',
            apellido_materno: 'User',
            correo: 'systemadmin@uv.mx',
            contrasena: '123456789',
            id_rol: 1,
            id_departamento: 1,
            pertenece_a_institucion: 1
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.contrasena, salt);
        user.contrasena = hash;

        let createdUser;
        let idUsuario;
        let checkUser;
        if (process.env.DB_TYPE === 'mysql') {
            console.log('Usuario creado en mysql');
            createdUser = await mysqlAuthRepository.createUser(user);
            idUsuario = createdUser.id_usuario;
            checkUser = await mysqlAuthRepository.getUserById(idUsuario);
        } else if (process.env.DB_TYPE === 'pg') {
            console.log('Usuario creado en postgres');
            createdUser = await pgAuthRepository.createUser(user);
            idUsuario = createdUser.id_usuario;
            checkUser = await pgAuthRepository.getUserById(idUsuario);
        }

        console.log('Usuario sembrado exitosamente:');
        console.log(JSON.stringify(checkUser, null, 2));
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar seed:', error);
        await pool.end();
        process.exit(1);
    }
}

main();