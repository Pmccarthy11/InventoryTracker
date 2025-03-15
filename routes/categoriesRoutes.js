const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const adminAuth = require('../middleware/authMiddleware'); // Import auth middleware

router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.post('/', adminAuth, categoriesController.createCategory);  // Protect category creation
router.put('/:id', adminAuth, categoriesController.updateCategory); // Protect category update
router.delete('/:id', adminAuth, categoriesController.deleteCategory); // Protect category deletion

module.exports = router;
