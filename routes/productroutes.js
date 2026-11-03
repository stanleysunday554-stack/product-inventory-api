
const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    adjustStock
} = require("../controllers/productcontrollers");

// Create product
router.post("/", createProduct);

// Get all products
router.get("/", getProducts);

// Adjust product stock
router.patch("/:id/stock", adjustStock);

// Get one product
router.get("/:id", getProduct);

// Update product
router.patch("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
