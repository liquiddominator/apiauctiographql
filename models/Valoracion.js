const mongoose = require('mongoose');

const ValoracionSchema = mongoose.Schema({
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
    ventaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Venta'
    },
    puntuacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: String,
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    Valoracion: mongoose.model('Valoracion', ValoracionSchema),
};