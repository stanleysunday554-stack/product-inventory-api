
const errorMiddleware = (err, req, res, next) => {

    // Duplicate SKU
    if (err.code === 11000) {
        return res.status(409).json({
            message: "A product with this SKU already exists"
        });
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
            error => error.message
        );

        return res.status(400).json({
            message: "Validation failed",
            errors: messages
        });
    }

    // Other errors
    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
};

module.exports = errorMiddleware;
