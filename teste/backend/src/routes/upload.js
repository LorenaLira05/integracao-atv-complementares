const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

router.post('/certificado/:submission_id', authMiddleware(['coordinator', 'student']), uploadController.uploadCertificado);
router.get('/certificado/:submission_id', authMiddleware(['coordinator', 'student']), uploadController.getCertificado);

module.exports = router;