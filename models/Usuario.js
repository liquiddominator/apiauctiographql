const mongoose = require('mongoose');

const UsuarioSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        calle: String,
        ciudad: String,
        codigoPostal: String
    },
    estado: {
        type: String,
        enum: ['activo', 'suspendido', 'baneado'],
        required: true
    },
    reputacion: Number,
    wallet: {
        saldo: mongoose.Types.Decimal128,
        saldoBloqueado: mongoose.Types.Decimal128
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    Usuario: mongoose.model('Usuario', UsuarioSchema),
};