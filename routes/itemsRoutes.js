const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

router.get('/low-stock', itemsController.getLowStockItems); // Low-stock route

// Other routes
router.get('/', itemsController.getAllItems);
router.get('/:id', itemsController.getItemById);
router.post('/', itemsController.createItem);
router.put('/:id', itemsController.updateItem);
router.delete('/:id', itemsController.deleteItem);

module.exports = router;
