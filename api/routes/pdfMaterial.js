const express = require('express');
const router = express.Router();
const { auth, isAdminOrInstructor, isStudent } = require('../middleware/auth');
const {
  listPdfs,
  listCategories,
  createCategory,
  deleteCategory,
  listForMock,
  createPdf,
  updatePdf,
  deletePdf,
  issueTicket,
  previewPdf,
  pdfPageCount,
  streamPdfPage,
  streamPdf,
  createOrder,
  verifyOrder,
  listExams,
  createExam,
  updateExam,
  deleteExam,
  createExamOrder,
  verifyExamOrder,
} = require('../controllers/pdfMaterial');

router.get('/', listPdfs);
router.get('/categories', auth, isAdminOrInstructor, listCategories);
router.post('/categories', auth, isAdminOrInstructor, createCategory);
router.delete('/categories/:id', auth, isAdminOrInstructor, deleteCategory);
router.get('/exams', listExams);
router.post('/exams', auth, isAdminOrInstructor, createExam);
router.put('/exams/:id', auth, isAdminOrInstructor, updateExam);
router.delete('/exams/:id', auth, isAdminOrInstructor, deleteExam);
router.post('/exams/:id/order', auth, isStudent, createExamOrder);
router.post('/exams/:id/verify', auth, isStudent, verifyExamOrder);
router.get('/for-mock/:mockId', listForMock);
router.post('/', auth, isAdminOrInstructor, createPdf);
router.put('/:id', auth, isAdminOrInstructor, updatePdf);
router.delete('/:id', auth, isAdminOrInstructor, deletePdf);
router.post('/:id/ticket', auth, issueTicket);
router.get('/:id/preview', previewPdf);
router.get('/:id/pages', pdfPageCount);
router.get('/:id/page/:page', streamPdfPage);
router.get('/:id/file', streamPdf);
router.post('/:id/order', auth, isStudent, createOrder);
router.post('/:id/verify', auth, isStudent, verifyOrder);

module.exports = router;
