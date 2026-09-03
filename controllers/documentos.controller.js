const {
  createDocument,
  updateDocumentDirection,
  updateDocumentInfo,
  getDocumentById,
  deleteDocument
} = require("../services/documentos.service.js");
const fs = require("fs");
const path = require("path");

async function addDocumento(req, res) {
  try {
    const { nombre, privado } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
    }
    if (!nombre) {
      return res.status(400).json({ success: false, message: "El nombre del documento es obligatorio" });
    }

    const idDepartamento = user.id_departamento;
    const subidoPor = user.nombre + " " + user.apellido_paterno + " " + user.apellido_materno;
    const esPrivado = (privado === 'on' || privado === 'true' || privado === true || privado === 1 || privado === '1') ? 1 : 0;

    const idDocumento = await createDocument(idDepartamento, user.id_usuario, nombre, subidoPor, esPrivado);

    const ext = path.extname(req.file.originalname);
    const deptDirName = `depto_${idDepartamento}`;
    const destDir = path.join(__dirname, "..", "uploads", "Departamentos", deptDirName);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const newFileName = `${idDocumento}${ext}`;
    const newPath = path.join(destDir, newFileName);

    try {
      fs.renameSync(req.file.path, newPath);
    } catch (renameError) {
      if (renameError.code === 'EXDEV') {
        fs.copyFileSync(req.file.path, newPath);
        fs.unlinkSync(req.file.path);
      } else {
        throw renameError;
      }
    }

    const direccion = path.join("uploads", "Departamentos", deptDirName, newFileName);
    await updateDocumentDirection(idDocumento, direccion);

    res.json({ success: true, message: "Documento guardado correctamente", idDocumento });
  } catch (error) {
    console.error("Error al guardar documento:", error);
    // Eliminar archivo temporal si existía y ocurrió un error posterior
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { console.error(e); }
    }
    res.status(500).json({ success: false, message: "Error al guardar documento" });
  }
}

async function viewDocument(req, res) {
  try {
    const { id } = req.params;
    const user = req.session.user;
    if (!user) return res.status(401).send("Usuario no autenticado");

    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).send("Documento no encontrado o eliminado");

    if (user.rol !== 1 && doc.id_departamento !== user.id_departamento) {
      return res.status(403).send("Acceso denegado: No tienes permisos para ver documentos de otros departamentos.");
    }

    if (user.rol === 4 && doc.privado === 1) {
      return res.status(403).send("Acceso denegado: Los auditores no tienen permisos para visualizar documentos confidenciales o privados.");
    }

    const filePath = path.join(__dirname, "..", doc.direccion);
    if (!fs.existsSync(filePath)) return res.status(404).send("Archivo físico no encontrado");
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res.status(500).send("Error al visualizar documento");
  }
}

async function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const user = req.session.user;
    if (!user) return res.status(401).send("Usuario no autenticado");

    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).send("Documento no encontrado o eliminado");

    if (user.rol !== 1 && doc.id_departamento !== user.id_departamento) {
      return res.status(403).send("Acceso denegado: No tienes permisos para descargar documentos de otros departamentos.");
    }
    if (user.rol === 4 && doc.privado === 1) {
      return res.status(403).send("Acceso denegado: Los auditores no tienen permisos para descargar documentos confidenciales o privados.");
    }

    const filePath = path.join(__dirname, "..", doc.direccion);
    if (!fs.existsSync(filePath)) return res.status(404).send("Archivo físico no encontrado");
    res.download(filePath, doc.nombre + path.extname(filePath));
  } catch (error) {
    console.error("Error al descargar documento:", error);
    res.status(500).send("Error al descargar documento");
  }
}

async function deleteDocumento(req, res) {
  try {
    const { id } = req.params;
    const user = req.session.user;
    if (!user) return res.status(401).json({ success: false, message: "Usuario no autenticado" });

    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Documento no encontrado" });

    if (user.rol !== 1 && doc.id_departamento !== user.id_departamento) {
      return res.status(403).json({ success: false, message: "Acceso denegado: No tienes permisos para eliminar documentos de otros departamentos." });
    }

    const affectedRows = await deleteDocument(id);
    if (affectedRows > 0) {
      res.json({ success: true, message: "Documento eliminado correctamente" });
    } else {
      res.status(404).json({ success: false, message: "Documento no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ success: false, message: "Error al eliminar documento" });
  }
}

async function updateDocumento(req, res) {
  try {
    const { id } = req.params;
    const { nombre, privado } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado" });
    }

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre del documento es obligatorio" });
    }

    const doc = await getDocumentById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Documento no encontrado o eliminado" });
    }

    if (user.rol === 4) {
      return res.status(403).json({ success: false, message: "Acceso denegado: Los auditores no tienen permisos para editar documentos." });
    }

    if (user.rol !== 1 && doc.id_departamento !== user.id_departamento) {
      return res.status(403).json({ success: false, message: "Acceso denegado: No tienes permisos para editar documentos de otros departamentos." });
    }

    const esPrivado = (privado === 'on' || privado === 'true' || privado === true || privado === 1 || privado === '1') ? 1 : 0;

    const affectedRows = await updateDocumentInfo(id, nombre.trim(), esPrivado);
    if (affectedRows > 0) {
      res.json({ success: true, message: "Documento actualizado correctamente" });
    } else {
      res.status(400).json({ success: false, message: "No se pudo actualizar el documento" });
    }
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    res.status(500).json({ success: false, message: "Error interno al actualizar documento" });
  }
}

module.exports = { addDocumento, viewDocument, downloadDocument, updateDocumento, deleteDocumento };
