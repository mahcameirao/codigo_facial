const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.flatten().fieldErrors
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';

    res.status(statusCode).json({
        error: message
    });
};

module.exports = errorHandler;
