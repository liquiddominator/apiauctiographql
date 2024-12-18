const mongoose = require('mongoose');


const ProductoSchema = mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: String,
    vendedorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    categoria: {
        type: String,
        required: true
    },
    subcategoria: String,
    tipo: {
        type: String,
        enum: ['subasta', 'ventaDirecta'],
        required: true
    },
    precio: mongoose.Types.Decimal128,
    imagenes: [String],
    estado: {
        type: String,
        enum: ['activo', 'vendido', 'cancelado'],
        required: true
    },
    condicion: {
        type: String,
        enum: ['nuevo', 'usado', 'reparado']
    },
    visitas: Number,
    fechaPublicacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    Producto: mongoose.model('Producto', ProductoSchema),
};