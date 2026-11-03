
const Product = require("../models/product");

// CREATE PRODUCT
const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};


// GET ALL PRODUCTS
const getProducts = async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 10,
            lowStock
        } = req.query;

        const filter = {};

        // Category filter
        if (category) {
            filter.category = {
                $regex: `^${category}$`,
                $options: "i"
            };
        }

        // Price filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                const min = Number(minPrice);

                if (!Number.isFinite(min) || min < 0) {
                    return res.status(400).json({
                        message: "Invalid minimum price"
                    });
                }

                filter.price.$gte = min;
            }

            if (maxPrice !== undefined) {
                const max = Number(maxPrice);

                if (!Number.isFinite(max) || max < 0) {
                    return res.status(400).json({
                        message: "Invalid maximum price"
                    });
                }

                filter.price.$lte = max;
            }

            if (
                filter.price.$gte !== undefined &&
                filter.price.$lte !== undefined &&
                filter.price.$gte > filter.price.$lte
            ) {
                return res.status(400).json({
                    message: "Minimum price cannot exceed maximum price"
                });
            }
        }

        // Search by product name
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Low stock filter
        if (lowStock === "true") {
            filter.stock = { $lte: 5 };
        }

        // Sorting
        let sortOption = {};

        if (sort === "price_asc") {
            sortOption.price = 1;
        } else if (sort === "price_desc") {
            sortOption.price = -1;
        } else {
            sortOption.createdAt = -1;
        }

        // Pagination
        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            !Number.isInteger(pageLimit) ||
            currentPage < 1 ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                message: "Invalid page or limit"
            });
        }

        const skip = (currentPage - 1) * pageLimit;

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(pageLimit);

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            totalProducts,
            currentPage,
            totalPages: Math.ceil(totalProducts / pageLimit),
            products
        });

    } catch (error) {
        next(error);
    }
};


// GET SINGLE PRODUCT
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
};


// UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
                upsert: false
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        next(error);
    }
};


// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


// ADJUST STOCK

const adjustStock = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity === 0) {
            return res.status(400).json({
                message: "Quantity must be a non-zero integer"
            });
        }

        const filter = {
            _id: req.params.id
        };

        // Prevent stock from becoming negative
        if (quantity < 0) {
            filter.stock = { $gte: Math.abs(quantity) };
        }

        const product = await Product.findOneAndUpdate(
            filter,
            {
                $inc: { stock: quantity }
            },
            {
                new: true
            }
        );

        if (!product) {
            const exists = await Product.exists({
                _id: req.params.id
            });

            if (!exists) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        res.status(200).json({
            message: "Stock adjusted successfully",
            product
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    adjustStock
};
