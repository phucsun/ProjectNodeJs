const path = require('path');
const multer = require('multer');

module.exports = () => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../uploads')); 
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now();
            cb(null, `${uniqueSuffix}-${file.originalname}`);
        }
    });

    return storage;
};
