const express=require('express')
const router=express.Router()
const saleController=require('../Controllers/saleController')

// API routes
router.get('/initialize', saleController.initializeDatabase);
router.get('/transactions', saleController.getTransactions);
router.get('/statistics', saleController.getStatistics);
router.get('/barchart', saleController.getBarChart);
router.get('/piechart', saleController.getPieChart);
router.get('/combined', saleController.getCombinedData);

module.exports = router;
