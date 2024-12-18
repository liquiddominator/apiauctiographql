const mongoose = require('mongoose');


const VentaSchema = mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Producto'
    },
    subastaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subasta'
    },
    vendedorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    compradorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    monto: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['pendiente', 'pagada', 'completada'],
        required: true
    }
});

module.exports = {
    Venta: mongoose.model('Venta', VentaSchema),
};