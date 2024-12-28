const {ApolloServer} = require('apollo-server');
const conectardDB = require('./config/db')
const typeDefs = require('./db/schemas');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'variables.env'});

//Levantamos la base de datos
conectardDB();

//Configuramos el servidor
const servidor= new ApolloServer({
    typeDefs,
    resolvers,
    context:({req})=>{
        const token = req.headers['authorization']||'';
        //verificamos si el token del usuario/vendedor es valido
        if(token){
            try {
                const usuario = jwt.verify(token, process.env.FIRMA_SECRETA);
                return{
                    usuario
                }

            }
            catch(error){

                console.error(error);
                console.log('Token invalido')
            }
        }
    }
});

//Levantamos el servidor
servidor.listen().then(({url})=>{
    console.log(`Base de datos conectada en la url: ${url}`);
})