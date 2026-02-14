const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Database errors
    if (err.code === '23505') {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'This record already exists'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            error: 'Foreign key violation',
            message: 'Referenced record does not exist'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
    });
};

module.exports = { errorHandler, notFound };
