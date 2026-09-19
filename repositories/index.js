const dotenv = require('dotenv');
dotenv.config();

const dbType = (process.env.DB_TYPE || 'postgres').trim().toLowerCase();

let authRepository;
let departmentRepository;
let documentRepository;
let permissionRepository;
let userRepository;
let dashboardRepository;

if (dbType === 'mysql') {
  authRepository = require('./mysql/auth.repository.js');
  departmentRepository = require('./mysql/department.repository.js');
  documentRepository = require('./mysql/document.repository.js');
  permissionRepository = require('./mysql/permission.repository.js');
  userRepository = require('./mysql/user.repository.js');
  dashboardRepository = require('./mysql/dashboard.repository.js');
} else {
  authRepository = require('./postgres/auth.repository.js');
  departmentRepository = require('./postgres/department.repository.js');
  documentRepository = require('./postgres/document.repository.js');
  permissionRepository = require('./postgres/permission.repository.js');
  userRepository = require('./postgres/user.repository.js');
  dashboardRepository = require('./postgres/dashboard.repository.js');
}

module.exports = {
  dbType,
  authRepository,
  departmentRepository,
  documentRepository,
  permissionRepository,
  userRepository,
  dashboardRepository,
};
