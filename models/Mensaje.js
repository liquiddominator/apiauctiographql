const mongoose = require('mongoose');

const MensajeSchema = mongoose.Schema({
    emisorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    receptorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    mensaje: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    leido: Boolean,
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    }
});

module.exports = {
    Mensaje: mongoose.model('Mensaje', MensajeSchema),
};