const mongoose = require('mongoose');

const NotificacionSchema = mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    tipo: {
        type: String,
        enum: ['nueva_puja', 'puja_superada', 'subasta_ganada', 'subasta_finalizada', 'venta_realizada', 'mensaje_recibido'],
        required: true
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
    leida: Boolean
});

module.exports = {
    Notificacion: mongoose.model('Notificacion', NotificacionSchema),
};