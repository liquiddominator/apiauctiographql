const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB, {
            // Opciones recomendadas para MongoDB Atlas
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Base de datos conectada exitosamente!!!');
    }
    catch (error) {
        console.log('Error al conectar la Base de Datos:');
        console.log(error.message);
        process.exit(1); // Detener la aplicación si no se puede conectar
    }
}

module.exports = conectarDB;