const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Carpeta temporal para guardar las cargas iniciales de Multer
const tempUploadDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    filename: (req, file, cb) => {
        // Nombre de archivo temporal y seguro
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname).toLowerCase();
        cb(null, `upload-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

module.exports = { upload };
