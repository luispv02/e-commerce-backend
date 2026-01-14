
const errorHandler = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Error interno del servidor';

    res.status(status).json({
        ok: false,
        msg: message
    })
}

module.exports = errorHandler;