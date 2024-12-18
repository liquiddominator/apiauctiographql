const mongoose = require('mongoose');


const PagoSchema = mongoose.Schema({
    ventaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Venta'
    },
    monto: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'completado', 'fallido'],
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['tarjeta', 'paypal', 'transferencia']
    },
    referencia: String,
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    Pago: mongoose.model('Pago', PagoSchema),
};