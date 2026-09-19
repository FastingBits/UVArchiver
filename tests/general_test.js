const http = require('http');
const { pool } = require('../config/db.js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ANSI colors for clean terminal output
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

async function testRBAC() {
  const results = [];

  // Helper to query PostgreSQL DB
  async function query(sql, params = []) {
    const res = await pool.query(sql, params);
    return res.rows;
  }

  try {
    // Ensure test users exist with known passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Get department 13 or create one
    let depts = await query('SELECT id_departamento FROM departamentos WHERE nombre = $1 AND deleted_at IS NULL', ['Depto Auditoria y Calidad']);
    let deptId;
    if (depts.length === 0) {
      const res = await query('INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING id_departamento', ['Depto Auditoria y Calidad', 'Pruebas']);
      deptId = res[0].id_departamento;
    } else {
      deptId = depts[0].id_departamento;
    }

    // Create another department for cross-dept testing
    let depts2 = await query('SELECT id_departamento FROM departamentos WHERE nombre = $1 AND deleted_at IS NULL', ['Depto Secundario QA']);
    let deptId2;
    if (depts2.length === 0) {
      const res2 = await query('INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING id_departamento', ['Depto Secundario QA', 'Pruebas 2']);
      deptId2 = res2[0].id_departamento;
    } else {
      deptId2 = depts2[0].id_departamento;
    }

    // Helper to upsert user atomically with PostgreSQL
    async function upsertUser(email, nombre, rol, dept, inst) {
      const res = await query(`
        INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, contrasena, id_rol, id_departamento, pertenece_a_institucion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (correo) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          id_rol = EXCLUDED.id_rol,
          id_departamento = EXCLUDED.id_departamento,
          pertenece_a_institucion = EXCLUDED.pertenece_a_institucion,
          contrasena = EXCLUDED.contrasena,
          deleted_at = NULL
        RETURNING id_usuario
      `, [nombre, 'Test', 'User', email, passwordHash, rol, dept, inst]);
      return res[0].id_usuario;
    }

    const sysAdminId = await upsertUser('system_admin@uv.mx', 'SysAdmin', 1, 1, 1);
    const admin1Id = await upsertUser('admin_dept1@uv.mx', 'AdminDept1', 2, deptId, 1);
    const admin2Id = await upsertUser('admin_dept2@uv.mx', 'AdminDept2', 2, deptId2, 1);
    const user1Id = await upsertUser('user_dept1@uv.mx', 'UserDept1', 3, deptId, 1);
    const user2Id = await upsertUser('user_dept2@uv.mx', 'UserDept2', 3, deptId2, 1);
    const auditorId = await upsertUser('auditor_dept1@uv.mx', 'AuditorDept1', 4, deptId, 1);
    const auditorSinDeptId = await upsertUser('auditor_externo@gmail.com', 'AuditorExt', 4, 1, 0);

    const PORT = process.env.PORT || 3000;

    // Helper to perform HTTP requests with session cookies
    function makeRequest(method, path, body, cookies = '') {
      return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : '';
        const req = http.request({
          hostname: 'localhost',
          port: PORT,
          path: path,
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Cookie': cookies
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            let parsed;
            try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
            const setCookie = res.headers['set-cookie'];
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsed,
              cookies: setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : cookies
            });
          });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
      });
    }

    async function login(email, password) {
      const res = await makeRequest('POST', '/api/auth/login', { correo: email, contraseña: password });
      return res.cookies;
    }

    console.log(`${c.dim}Iniciando sesiones de prueba...${c.reset}`);
    const sysAdminCookie = await login('system_admin@uv.mx', 'password123');
    const admin1Cookie = await login('admin_dept1@uv.mx', 'password123');
    const admin2Cookie = await login('admin_dept2@uv.mx', 'password123');
    const user1Cookie = await login('user_dept1@uv.mx', 'password123');
    const auditorCookie = await login('auditor_dept1@uv.mx', 'password123');

    // TEST 1: Authentication
    // 0.1 Login with valid credentials
    const sysLogin = await makeRequest('POST', '/api/auth/login', { correo: 'system_admin@uv.mx', contraseña: 'password123' });
    const adminLogin = await makeRequest('POST', '/api/auth/login', { correo: 'admin_dept1@uv.mx', contraseña: 'password123' });
    const userLogin = await makeRequest('POST', '/api/auth/login', { correo: 'user_dept1@uv.mx', contraseña: 'password123' });
    const auditorLogin = await makeRequest('POST', '/api/auth/login', { correo: 'auditor_dept1@uv.mx', contraseña: 'password123' });
    results.push({ test: 'SysAdmin puede iniciar sesión', status: sysLogin.statusCode === 200 ? 'PASS' : 'FAIL', code: sysLogin.statusCode });
    results.push({ test: 'Admin puede iniciar sesión', status: adminLogin.statusCode === 200 ? 'PASS' : 'FAIL', code: adminLogin.statusCode });
    results.push({ test: 'User puede iniciar sesión', status: userLogin.statusCode === 200 ? 'PASS' : 'FAIL', code: userLogin.statusCode });
    results.push({ test: 'Auditor puede iniciar sesión', status: auditorLogin.statusCode === 200 ? 'PASS' : 'FAIL', code: auditorLogin.statusCode });

    // 0.2 Login with invalid credentials
    const sysInvalidLogin = await makeRequest('POST', '/api/auth/login', { correo: 'system_admin@uv.mx', contraseña: 'wrongpassword' });
    const adminInvalidLogin = await makeRequest('POST', '/api/auth/login', { correo: 'admin_dept1@uv.mx', contraseña: 'wrongpassword' });
    const userInvalidLogin = await makeRequest('POST', '/api/auth/login', { correo: 'user_dept1@uv.mx', contraseña: 'wrongpassword' });
    const auditorInvalidLogin = await makeRequest('POST', '/api/auth/login', { correo: 'auditor_dept1@uv.mx', contraseña: 'wrongpassword' });
    results.push({ test: 'SysAdmin rechaza credenciales inválidas (401)', status: sysInvalidLogin.statusCode === 401 ? 'PASS' : 'FAIL', code: sysInvalidLogin.statusCode });
    results.push({ test: 'Admin rechaza credenciales inválidas (401)', status: adminInvalidLogin.statusCode === 401 ? 'PASS' : 'FAIL', code: adminInvalidLogin.statusCode });
    results.push({ test: 'User rechaza credenciales inválidas (401)', status: userInvalidLogin.statusCode === 401 ? 'PASS' : 'FAIL', code: userInvalidLogin.statusCode });
    results.push({ test: 'Auditor rechaza credenciales inválidas (401)', status: auditorInvalidLogin.statusCode === 401 ? 'PASS' : 'FAIL', code: auditorInvalidLogin.statusCode });

    // TEST 2: Department Management
    // 1.1 Read departments
    const sysReadDept = await makeRequest('GET', '/departamentos', null, sysAdminCookie);
    const adminReadDept = await makeRequest('GET', '/departamentos', null, admin1Cookie);
    const userReadDept = await makeRequest('GET', '/departamentos', null, user1Cookie);
    const auditorReadDept = await makeRequest('GET', '/departamentos', null, auditorCookie);
    results.push({ test: 'SysAdmin puede ver /departamentos', status: sysReadDept.statusCode === 200 ? 'PASS' : 'FAIL', code: sysReadDept.statusCode });
    results.push({ test: 'Admin no puede ver /departamentos (403)', status: adminReadDept.statusCode === 403 ? 'PASS' : 'FAIL', code: adminReadDept.statusCode });
    results.push({ test: 'User no puede ver /departamentos (403)', status: userReadDept.statusCode === 403 ? 'PASS' : 'FAIL', code: userReadDept.statusCode });
    results.push({ test: 'Auditor no puede ver /departamentos (403)', status: auditorReadDept.statusCode === 403 ? 'PASS' : 'FAIL', code: auditorReadDept.statusCode });

    // 1.2 Add department via API
    const sysAddDept = await makeRequest('POST', '/api/departamentos', { name: 'Depto Test Api ' + Date.now(), descripcion: 'Desc' }, sysAdminCookie);
    const adminAddDept = await makeRequest('POST', '/api/departamentos', { name: 'Depto Admin Fail', descripcion: 'Desc' }, admin1Cookie);
    results.push({ test: 'SysAdmin puede agregar departamento (200)', status: sysAddDept.statusCode === 200 ? 'PASS' : 'FAIL', code: sysAddDept.statusCode, res: sysAddDept.body });
    results.push({ test: 'Admin no puede agregar departamento (403)', status: adminAddDept.statusCode === 403 ? 'PASS' : 'FAIL', code: adminAddDept.statusCode });

    // TEST 3: Users Module
    // 2.1 Read Users
    const sysReadUsers = await makeRequest('GET', '/api/usuarios', null, sysAdminCookie);
    const adminReadUsers = await makeRequest('GET', '/api/usuarios', null, admin1Cookie);
    const userReadUsers = await makeRequest('GET', '/api/usuarios', null, user1Cookie);
    const auditorReadUsers = await makeRequest('GET', '/api/usuarios', null, auditorCookie);
    results.push({ test: 'SysAdmin puede leer /api/usuarios', status: sysReadUsers.statusCode === 200 ? 'PASS' : 'FAIL', count: sysReadUsers.body?.users?.length });

    // Admin should only see users of their dept
    const adminVisibleUsers = adminReadUsers.body?.users || [];
    const adminSeesOnlyDept = adminVisibleUsers.every(u => u.id_departamento === deptId);
    results.push({ test: 'Admin puede leer solo usuarios de su departamento', status: (adminReadUsers.statusCode === 200 && adminSeesOnlyDept) ? 'PASS' : 'FAIL', count: adminVisibleUsers.length, seesOnlyDept: adminSeesOnlyDept });
    results.push({ test: 'User no puede leer /api/usuarios (403)', status: userReadUsers.statusCode === 403 ? 'PASS' : 'FAIL', code: userReadUsers.statusCode });
    results.push({ test: 'Auditor no puede leer /api/usuarios (403)', status: auditorReadUsers.statusCode === 403 ? 'PASS' : 'FAIL', code: auditorReadUsers.statusCode });

    // 2.2 Add User Rules
    // Rule A: External user (@gmail.com) with system_admin (rol 1) -> must fail (400 or 403)
    const addExtSysAdmin = await makeRequest('POST', '/api/usuarios', {
      nombre: 'ExtSys', apellido_paterno: 'A', apellido_materno: 'B', correo: `ext_sys_${Date.now()}@gmail.com`, contrasena: '123',
      id_rol: 1, id_departamento: 1, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({ test: 'Usuario externo no puede ser SysAdmin (addUser)', status: (addExtSysAdmin.statusCode === 400 || addExtSysAdmin.statusCode === 403) ? 'PASS' : 'FAIL', code: addExtSysAdmin.statusCode, msg: addExtSysAdmin.body?.message });

    // Rule B: External user (@gmail.com) with Sin Departamento (id 1) and rol Admin (2) -> must fail (400)
    const addExtAdminSinDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'ExtAdminSinDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `ext_admin_sindept_${Date.now()}@gmail.com`, contrasena: '123',
      id_rol: 2, id_departamento: 1, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({ test: 'Usuario externo en Sin Dept no puede ser Admin (addUser)', status: (addExtAdminSinDept.statusCode === 400) ? 'PASS' : 'FAIL', code: addExtAdminSinDept.statusCode, msg: addExtAdminSinDept.body?.message });

    // Rule C: External user (@gmail.com) with Sin Departamento (id 1) and rol User (3) -> must fail (400)
    const addExtUserSinDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'ExtUserSinDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `ext_user_sindept_${Date.now()}@gmail.com`, contrasena: '123',
      id_rol: 3, id_departamento: 1, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({ test: 'Usuario externo en Sin Dept no puede ser User (addUser)', status: (addExtUserSinDept.statusCode === 400) ? 'PASS' : 'FAIL', code: addExtUserSinDept.statusCode, msg: addExtUserSinDept.body?.message });

    // Rule D: External user (@gmail.com) with Sin Departamento (id 1) and rol Auditor (4) -> must succeed (200)
    const addExtAuditorSinDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'ExtAuditorSinDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `ext_auditor_sindept_${Date.now()}@gmail.com`, contrasena: '123',
      id_rol: 4, id_departamento: 1, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({ test: 'Usuario externo en Sin Dept puede ser Auditor (addUser)', status: (addExtAuditorSinDept.statusCode === 200) ? 'PASS' : 'FAIL', code: addExtAuditorSinDept.statusCode, msg: addExtAuditorSinDept.body?.message });

    // Rule E: External user (@gmail.com) attempted to be created as User (3) -> must fail (400)
    const addExtUserWithDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'ExtUserWithDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `ext_user_dept_${Date.now()}@gmail.com`, contrasena: '123',
      id_rol: 3, id_departamento: deptId, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({ test: 'Usuario externo con dept real no puede ser User/Admin (addUser)', status: (addExtUserWithDept.statusCode === 400) ? 'PASS' : 'FAIL', code: addExtUserWithDept.statusCode, msg: addExtUserWithDept.body?.message });

    // Rule F: Any user (even @uv.mx) in Sin Departamento (id 1) cannot be Admin (2) or User (3)
    const addInstUserSinDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'InstUserSinDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `inst_user_sindept_${Date.now()}@uv.mx`, contrasena: '123',
      id_rol: 3, id_departamento: 1, pertenece_a_institucion: 1
    }, sysAdminCookie);
    results.push({ test: 'Usuario institucional en Sin Dept no puede ser User (addUser)', status: (addInstUserSinDept.statusCode === 400) ? 'PASS' : 'FAIL', code: addInstUserSinDept.statusCode, msg: addInstUserSinDept.body?.message });

    // Rule G: Admin Dept attempts to add user in another dept
    const addAdminCrossDept = await makeRequest('POST', '/api/usuarios', {
      nombre: 'UsuarioFueraDeSuDept', apellido_paterno: 'A', apellido_materno: 'B', correo: `cross_user_${Date.now()}@uv.mx`, contrasena: '123',
      id_rol: 3, id_departamento: deptId2, pertenece_a_institucion: 1
    }, admin1Cookie);
    // Note: user.controller forces finalDeptId = loggedUser.id_departamento, let's verify where it was created
    if (addAdminCrossDept.body?.userId) {
      const created = await query('SELECT id_departamento FROM usuarios WHERE id_usuario = $1', [addAdminCrossDept.body.userId]);
      results.push({ test: 'Admin Dept no puede crear usuario en otro dept (forced to own dept)', status: (created[0]?.id_departamento === deptId) ? 'PASS' : 'FAIL', actualDept: created[0]?.id_departamento });
    }

    // Rule H: Admin Dept attempts to create system_admin (rol 1)
    const addAdminSys = await makeRequest('POST', '/api/usuarios', {
      nombre: 'AdminTriesSys', apellido_paterno: 'A', apellido_materno: 'B', correo: `admin_tries_sys_${Date.now()}@uv.mx`, contrasena: '123',
      id_rol: 1, id_departamento: deptId, pertenece_a_institucion: 1
    }, admin1Cookie);
    results.push({ test: 'Admin Dept no puede asignar system_admin (addUser)', status: (addAdminSys.statusCode === 403) ? 'PASS' : 'FAIL', code: addAdminSys.statusCode, msg: addAdminSys.body?.message });

    // 2.3 Update User Rules
    // Update Rule 1: Admin Dept attempts to edit user from another department (user2Id in deptId2)
    const updateCrossDept = await makeRequest('PUT', `/api/usuarios/${user2Id}`, {
      nombre: 'Hacked', apellido_paterno: 'A', apellido_materno: 'B', correo: 'user_dept2@uv.mx',
      id_rol: 3, id_departamento: deptId, pertenece_a_institucion: 1
    }, admin1Cookie);
    results.push({ test: 'Admin Dept no puede actualizar usuario en otro dept (403)', status: (updateCrossDept.statusCode === 403) ? 'PASS' : 'FAIL', code: updateCrossDept.statusCode, msg: updateCrossDept.body?.message });

    // Update Rule 2: Admin Dept attempts to promote own user to system_admin
    const updatePromoteSys = await makeRequest('PUT', `/api/usuarios/${user1Id}`, {
      nombre: 'UserDept1', apellido_paterno: 'Test', apellido_materno: 'User', correo: 'user_dept1@uv.mx',
      id_rol: 1, id_departamento: deptId, pertenece_a_institucion: 1
    }, admin1Cookie);
    results.push({ test: 'Admin Dept no puede promover usuario a system_admin (403)', status: (updatePromoteSys.statusCode === 403) ? 'PASS' : 'FAIL', code: updatePromoteSys.statusCode, msg: updatePromoteSys.body?.message });

    // Update Rule 3: External user (@gmail.com) attempted to be updated to User (rol 3) or Admin (rol 2) -> must fail (400)
    const extUserInDeptId = await upsertUser(`ext_test_up_${Date.now()}@gmail.com`, 'ExtToUpdate', 4, deptId, 0);
    const updateExtToUser = await makeRequest('PUT', `/api/usuarios/${extUserInDeptId}`, {
      nombre: 'ExtToUpdate', apellido_paterno: 'Test', apellido_materno: 'User', correo: `ext_test_up_${Date.now()}@gmail.com`,
      id_rol: 3, id_departamento: deptId, pertenece_a_institucion: 0
    }, sysAdminCookie);
    results.push({
      test: 'Usuario externo no puede ser actualizado a User/Admin (solo Auditor permitido)',
      status: (updateExtToUser.statusCode === 400) ? 'PASS' : 'FAIL',
      code: updateExtToUser.statusCode,
      msg: updateExtToUser.body?.message
    });

    // Update Rule 4: System Admin sets user in Sin Departamento (id 1) to rol 2 or 3 -> must fail (400)
    const updateSinDeptToAdmin = await makeRequest('PUT', `/api/usuarios/${user1Id}`, {
      nombre: 'UserDept1', apellido_paterno: 'Test', apellido_materno: 'User', correo: 'user_dept1@uv.mx',
      id_rol: 2, id_departamento: 1, pertenece_a_institucion: 1
    }, sysAdminCookie);
    results.push({
      test: 'Usuario en Sin Dept (1) no puede tener rol de Admin (2) incluso si lo actualiza SysAdmin (400)',
      status: (updateSinDeptToAdmin.statusCode === 400) ? 'PASS' : 'FAIL',
      code: updateSinDeptToAdmin.statusCode,
      msg: updateSinDeptToAdmin.body?.message
    });

    // 2.4 Delete User Rules
    const tempUser1 = await upsertUser(`temp_user1_${Date.now()}@uv.mx`, 'Temp1', 3, deptId, 1);
    const tempUser2 = await upsertUser(`temp_user2_${Date.now()}@uv.mx`, 'Temp2', 3, deptId2, 1);

    // Admin Dept attempts to delete user -> must fail (403)
    const adminDeleteOwn = await makeRequest('DELETE', `/api/usuarios/${tempUser1}`, null, admin1Cookie);
    results.push({
      test: 'Admin Dept no puede eliminar usuarios (403)',
      status: adminDeleteOwn.statusCode === 403 ? 'PASS' : 'FAIL',
      code: adminDeleteOwn.statusCode,
      msg: adminDeleteOwn.body?.message
    });

    // SysAdmin deletes user -> must succeed (200)
    const sysDelete = await makeRequest('DELETE', `/api/usuarios/${tempUser2}`, null, sysAdminCookie);
    results.push({
      test: 'SysAdmin puede eliminar usuario (200)',
      status: sysDelete.statusCode === 200 ? 'PASS' : 'FAIL',
      code: sysDelete.statusCode,
      msg: sysDelete.body?.message
    });

    // TEST 4: Documents Module & Supervision View
    // Read own documents
    const sysReadDoc = await makeRequest('GET', '/documentos', null, sysAdminCookie);
    const adminReadDoc = await makeRequest('GET', '/documentos', null, admin1Cookie);
    const userReadDoc = await makeRequest('GET', '/documentos', null, user1Cookie);
    const auditorReadDoc = await makeRequest('GET', '/documentos', null, auditorCookie);
    results.push({ test: 'SysAdmin puede leer /documentos', status: sysReadDoc.statusCode === 200 ? 'PASS' : 'FAIL', code: sysReadDoc.statusCode });
    results.push({ test: 'Admin puede leer /documentos', status: adminReadDoc.statusCode === 200 ? 'PASS' : 'FAIL', code: adminReadDoc.statusCode });
    results.push({ test: 'User puede leer /documentos', status: userReadDoc.statusCode === 200 ? 'PASS' : 'FAIL', code: userReadDoc.statusCode });
    results.push({ test: 'Auditor puede leer /documentos', status: auditorReadDoc.statusCode === 200 ? 'PASS' : 'FAIL', code: auditorReadDoc.statusCode });

    // Supervision view /documentos/departamento/:id_departamento
    const sysSupervision = await makeRequest('GET', `/documentos/departamento/${deptId}`, null, sysAdminCookie);
    const adminSupervision = await makeRequest('GET', `/documentos/departamento/${deptId2}`, null, admin1Cookie);
    const userSupervision = await makeRequest('GET', `/documentos/departamento/${deptId2}`, null, user1Cookie);
    const auditorSupervision = await makeRequest('GET', `/documentos/departamento/${deptId2}`, null, auditorCookie);
    results.push({ test: 'SysAdmin puede acceder a supervisión /documentos/departamento/:id', status: sysSupervision.statusCode === 200 ? 'PASS' : 'FAIL', code: sysSupervision.statusCode });
    results.push({ test: 'Admin no puede acceder a supervisión de otro departamento (403)', status: adminSupervision.statusCode === 403 ? 'PASS' : 'FAIL', code: adminSupervision.statusCode });
    results.push({ test: 'User no puede acceder a supervisión de departamentos (403)', status: userSupervision.statusCode === 403 ? 'PASS' : 'FAIL', code: userSupervision.statusCode });
    results.push({ test: 'Auditor no puede acceder a supervisión de departamentos (403)', status: auditorSupervision.statusCode === 403 ? 'PASS' : 'FAIL', code: auditorSupervision.statusCode });

    // Impresión de resultados con formato profesional
    console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
    console.log(`${c.bold}${c.cyan}                   REPORTE DETALLADO DE PRUEBAS RBAC                   ${c.reset}`);
    console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

    results.forEach((r, idx) => {
      const num = (idx + 1).toString().padStart(2, '0');
      const isPass = r.status === 'PASS';
      const badge = isPass
        ? `${c.green}${c.bold}✔ PASS${c.reset}`
        : `${c.red}${c.bold}✖ FAIL${c.reset}`;
      const codeInfo = r.code ? `${c.dim}[HTTP ${r.code}]${c.reset}` : '';
      console.log(` ${c.dim}${num}.${c.reset} ${badge}  ${r.test} ${codeInfo}`);
      if (!isPass) {
        if (r.msg) console.log(`        ${c.yellow}↳ Detalle: ${r.msg}${c.reset}`);
        if (r.res) console.log(`        ${c.yellow}↳ Respuesta: ${JSON.stringify(r.res)}${c.reset}`);
      }
    });

    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const passPercent = ((passed / total) * 100).toFixed(1);
    const failPercent = ((failed / total) * 100).toFixed(1);

    console.log(`\n${c.bold}${c.cyan}--------------------------------------------------------------------------------${c.reset}`);
    console.log(`${c.bold}RESUMEN FINAL:${c.reset}`);
    console.log(`   Total de pruebas ejecutadas: ${c.bold}${total}${c.reset}`);
    console.log(`   ${c.green}✔ Pruebas aprobadas:         ${passed} (${passPercent}%)${c.reset}`);
    console.log(`   ${failed > 0 ? c.red : c.dim}✖ Pruebas fallidas:          ${failed} (${failPercent}%)${c.reset}`);
    console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

    return failed;
  } finally {
    await pool.end();
  }
}

testRBAC().then(failedCount => {
  process.exit(failedCount > 0 ? 1 : 0);
}).catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.error('\n ERROR DE CONEXIÓN: El servidor HTTP no está en ejecución.');
    console.error(' Inicia la aplicación con "pnpm run dev" en otra terminal antes de correr este test.\n');
  } else {
    console.error('\n Error fatal ejecutando pruebas:', err);
  }
  process.exit(1);
});
