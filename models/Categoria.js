const mongoose = require('mongoose');


const CategoriaSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: String,
    imagen: String,
    estado: {
        type: String,
        enum: ['activa', 'inactiva'],
        required: true
    }
});

module.exports = {
    Categoria: mongoose.model('Categoria', CategoriaSchema),
};