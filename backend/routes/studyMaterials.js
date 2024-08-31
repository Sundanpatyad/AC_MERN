const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createMaterial, getMaterials, getMaterialsByCategory, createCategory, getCategories, createComment, getCommentsByMaterial } = require('../controllers/stydyMaterial');

router.post('/materials',createMaterial);
router.get('/materials', auth, getMaterials);
router.get('/materials/category/:categoryId', auth, getMaterialsByCategory);

router.post('/categories', auth, createCategory);
router.get('/categories', auth, getCategories);

router.post('/comments', auth, createComment);
router.get('/comments/material/:materialId', auth, getCommentsByMaterial);

module.exports = router;
