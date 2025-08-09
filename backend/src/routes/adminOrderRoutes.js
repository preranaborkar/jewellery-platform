// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {getAllOrders,getOrderDetails,updateOrderStatus,getStats} = require('../controllers/adminOrderController');

router.get('/stats', getStats);
router.get('/', getAllOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', updateOrderStatus);


module.exports = router;