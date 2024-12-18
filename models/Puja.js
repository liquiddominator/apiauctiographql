const mongoose = require('mongoose');


const PujaSchema = mongoose.Schema({
    subastaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subasta'
    },
    usuarioId: {
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
        enum: ['activa', 'superada', 'ganadora']
    }
});

module.exports = {
    Puja: mongoose.model('Puja', PujaSchema),
};