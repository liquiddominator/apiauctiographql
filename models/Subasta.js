const mongoose = require('mongoose');


const SubastaSchema = mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Producto'
    },
    vendedorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    precioInicial: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    precioActual: mongoose.Types.Decimal128,
    incrementoMinimo: mongoose.Types.Decimal128,
    precioReserva: mongoose.Types.Decimal128,
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ['activa', 'finalizada', 'cancelada'],
        required: true
    },
    ganadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    cantidadPujas: Number
});

module.exports = {
    Subasta: mongoose.model('Subasta', SubastaSchema),
};