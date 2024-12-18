const mongoose = require('mongoose');

const FavoritoSchema = mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Producto'
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = {
    Favorito: mongoose.model('Favorito', FavoritoSchema),
};