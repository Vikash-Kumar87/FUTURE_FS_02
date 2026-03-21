const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  uploadLeadAttachment,
  getLeadAttachment,
  addLeadNoteById,
  exportLeadsCsv,
} = require('../controllers/leadController');
const { authenticate } = require('../middleware/authMiddleware');

const uploadDir = path.resolve(process.cwd(), 'uploads', 'leads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname) || '';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validType = /pdf|jpg|jpeg|png|webp|doc|docx|msword|officedocument|text\/plain/.test(file.mimetype.toLowerCase());

    if (!validType) {
      return cb(new Error('Only PDF, image, and document files are allowed'));
    }

    return cb(null, true);
  },
});

const router = express.Router();

router.use(authenticate);

router.get('/export/csv', exportLeadsCsv);
router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/attachment', upload.single('file'), uploadLeadAttachment);
router.post('/:id/notes', addLeadNoteById);
router.get('/:id/attachment', getLeadAttachment);

module.exports = router;
