const mongoose = require('mongoose');


const EnvioSchema = mongoose.Schema({
    ventaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Venta'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'enviado', 'entregado'],
        required: true
    },
    tracking: String,
    direccionEnvio: String,
    fechaEnvio: Date,
    fechaEntrega: Date
});

module.exports = {
    Envio: mongoose.model('Envio', EnvioSchema)
};