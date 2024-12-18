const { gql } = require('apollo-server');

const typeDefs = gql`
    "Queries del sistema"
    type Query {
        "Queries de Usuario"
        obtenerUsuario(token: String!): Usuario
        obtenerPerfilUsuario(id: ID!): Usuario
        obtenerUsuarios: [Usuario]

        "Queries de Categoría"
        obtenerCategorias: [Categoria]
        obtenerCategoria(id: ID!): Categoria
        obtenerCategoriasActivas: [Categoria]

        "Queries de Producto"
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto
        obtenerProductosPorVendedor(vendedorId: ID!): [Producto]
        obtenerProductosPorCategoria(categoria: String!): [Producto]
        obtenerProductosActivos: [Producto]

        "Queries de Subasta"
        obtenerSubastas: [Subasta]
        obtenerSubasta(id: ID!): Subasta
        obtenerSubastasActivas: [Subasta]
        obtenerSubastasPorVendedor(vendedorId: ID!): [Subasta]
        obtenerSubastasPorGanador(ganadorId: ID!): [Subasta]

        "Queries de Puja"
        obtenerPujas: [Puja]
        obtenerPuja(id: ID!): Puja
        obtenerPujasPorSubasta(subastaId: ID!): [Puja]
        obtenerPujasPorUsuario(usuarioId: ID!): [Puja]

        "Queries de Venta"
        obtenerVentas: [Venta]
        obtenerVenta(id: ID!): Venta
        obtenerVentasPorVendedor(vendedorId: ID!): [Venta]
        obtenerVentasPorComprador(compradorId: ID!): [Venta]
        obtenerVentasPorProducto(productoId: ID!): [Venta]
        obtenerVentasPorSubasta(subastaId: ID!): [Venta]

        "Queries de Pago"
        obtenerPagos: [Pago]
        obtenerPago(id: ID!): Pago
        obtenerPagosPorVenta(ventaId: ID!): [Pago]

        "Queries de Envío"
        obtenerEnvios: [Envio]
        obtenerEnvio(id: ID!): Envio
        obtenerEnviosPorVenta(ventaId: ID!): [Envio]

        "Queries de Favorito"
        obtenerFavoritos(usuarioId: ID!): [Favorito]
        obtenerFavoritosPorProducto(productoId: ID!): [Favorito]

        "Queries de Mensaje"
        obtenerMensajes: [Mensaje]
        obtenerMensajesEnviados: [Mensaje]
        obtenerMensajesRecibidos: [Mensaje]
        obtenerMensajesPorProducto(productoId: ID!): [Mensaje]
        obtenerConversacion(usuarioId: ID!): [Mensaje]

        "Queries de Notificación"
        obtenerNotificaciones: [Notificacion]
        obtenerNotificacionesNoLeidas: [Notificacion]
        obtenerNotificacionesPorTipo(tipo: TipoNotificacion!): [Notificacion]

        "Queries de Valoración"
        obtenerValoraciones: [Valoracion]
        obtenerValoracionesPorVendedor(vendedorId: ID!): [Valoracion]
        obtenerValoracionesPorComprador(compradorId: ID!): [Valoracion]
        obtenerValoracionPorVenta(ventaId: ID!): Valoracion
    }
    
# Usuario

    type Usuario {
        id: ID
        username: String!
        email: String!
        nombre: String
        telefono: String
        direccion: Direccion
        estado: EstadoUsuario!
        reputacion: Float
        wallet: Wallet!
        fechaRegistro: String
    }

    type Direccion {
        calle: String
        ciudad: String
        codigoPostal: String
    }

    type Wallet {
        saldo: Float!           
        saldoBloqueado: Float!
    }

    type Token {
        token: String!
    }

    enum EstadoUsuario {
        activo
        suspendido
        baneado
    }
    
# Categoria

    type Categoria {
        id: ID!
        nombre: String!
        descripcion: String
        imagen: String
        estado: EstadoCategoria!
    }

    enum EstadoCategoria {
        activa
        inactiva
    }
    
# Producto    
    
    type Producto {
        id: ID!
        titulo: String!
        descripcion: String
        vendedor: Usuario!
        categoria: String!
        subcategoria: String
        tipo: TipoProducto!
        precio: Float!
        imagenes: [String]
        estado: EstadoProducto!
        condicion: CondicionProducto
        visitas: Int
        fechaPublicacion: String
    }

    enum TipoProducto {
        subasta
        ventaDirecta
    }

    enum EstadoProducto {
        activo
        vendido
        cancelado
    }

    enum CondicionProducto {
        nuevo
        usado
        reparado
    }
    
# Subasta

    type Subasta {
        id: ID!
        producto: Producto
        vendedor: Usuario!
        precioInicial: Float!
        precioActual: Float
        incrementoMinimo: Float
        precioReserva: Float
        fechaInicio: String!
        fechaFin: String!
        estado: EstadoSubasta!
        ganador: Usuario
        cantidadPujas: Int
    }

    enum EstadoSubasta {
        activa
        finalizada
        cancelada
    }
    
# Puja
    
    type Puja {
        id: ID!
        subasta: Subasta!
        usuario: Usuario!
        monto: Float!
        fecha: String!
        estado: EstadoPuja
    }
    
    enum EstadoPuja {
        activa
        superada
        ganadora
    }
    
# Venta
    
    type Venta {
        id: ID!
        producto: Producto!
        subasta: Subasta
        vendedor: Usuario!
        comprador: Usuario!
        monto: Float!
        fecha: String!
        estado: EstadoVenta!
    }

    enum EstadoVenta {
        pendiente
        pagada
        completada
    }
    
# Pago
    
    type Pago {
        id: ID!
        venta: Venta!
        monto: Float!
        estado: EstadoPago!
        metodoPago: MetodoPago
        referencia: String
        fecha: String
    }

    enum EstadoPago {
        pendiente
        completado
        fallido
    }

    enum MetodoPago {
        tarjeta
        paypal
        transferencia
    }
    
# Envio
    
    type Envio {
        id: ID!
        venta: Venta!
        estado: EstadoEnvio!
        tracking: String
        direccionEnvio: String
        fechaEnvio: String
        fechaEntrega: String
    }
    
    enum EstadoEnvio {
        pendiente
        enviado
        entregado
    }
    
# Favorito
    
    type Favorito {
        id: ID!
        usuario: Usuario!
        producto: Producto!
        fecha: String!
    }
    
# Mensaje
    
    type Mensaje {
        id: ID!
        emisor: Usuario!
        receptor: Usuario!
        mensaje: String!
        fecha: String!
        leido: Boolean
        producto: Producto
    }
    
# Notificacion
    
    type Notificacion {
        id: ID!
        usuario: Usuario!
        tipo: TipoNotificacion!
        mensaje: String!
        fecha: String!
        leida: Boolean
    }
    
    enum TipoNotificacion {
        nueva_puja
        puja_superada
        subasta_ganada
        subasta_finalizada
        venta_realizada
        mensaje_recibido
    }
    
# Valoracion
    
    type Valoracion {
        id: ID!
        vendedor: Usuario!
        comprador: Usuario!
        venta: Venta!
        puntuacion: Int!
        comentario: String
        fecha: String!
    }

# Usuario    

    input UsuarioInput {
        username: String!
        email: String!
        password: String!
        nombre: String
        telefono: String
        direccion: DireccionInput
    }

    input DireccionInput {
        calle: String
        ciudad: String
        codigoPostal: String
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ActualizarUsuarioInput {
        username: String
        email: String
        password: String
        nombre: String
        telefono: String
        direccion: DireccionInput
        estado: EstadoUsuario
    }
    
# Categoria    

    input CategoriaInput {
        nombre: String!
        descripcion: String
        imagen: String
        estado: EstadoCategoria!
    }

    input ActualizarCategoriaInput {
        nombre: String
        descripcion: String
        imagen: String
        estado: EstadoCategoria
    }
    
# Producto    
    
    input ProductoInput {
        titulo: String!
        descripcion: String
        categoria: String!
        subcategoria: String
        tipo: TipoProducto!
        precio: Float!
        imagenes: [String]
        condicion: CondicionProducto
    }

    input ActualizarProductoInput {
        titulo: String
        descripcion: String
        categoria: String
        subcategoria: String
        precio: Float
        imagenes: [String]
        estado: EstadoProducto
        condicion: CondicionProducto
    }
    
# Subasta

    input SubastaInput {
        productoId: ID!
        precioInicial: Float!
        incrementoMinimo: Float!
        precioReserva: Float
        fechaInicio: String!
        fechaFin: String!
    }

    input ActualizarSubastaInput {
        precioInicial: Float
        incrementoMinimo: Float
        precioReserva: Float
        fechaInicio: String
        fechaFin: String
        estado: EstadoSubasta
    }

# Puja
    
    input PujaInput {
        subastaId: ID!
        monto: Float!
    }
    
# Venta
    
    input VentaInput {
        productoId: ID!
        subastaId: ID
        compradorId: ID!
        monto: Float!
    }
    
# Pago
    
    input PagoInput {
        ventaId: ID!
        monto: Float!
        metodoPago: MetodoPago!
        referencia: String
    }
    
# Envio
    
    input EnvioInput {
        ventaId: ID!
        direccionEnvio: String!
    }
    
# Favorito

    input FavoritoInput {
        productoId: ID!
    }
    
# Mensaje

    input MensajeInput {
        receptorId: ID!
        mensaje: String!
        productoId: ID
    }
    
# Notificacion
    
    input NotificacionInput {
        usuarioId: ID!
        tipo: TipoNotificacion!
        mensaje: String!
    }
    
# Valoracion

    input ValoracionInput {
        ventaId: ID!
        puntuacion: Int!
        comentario: String
    }

    "Mutations del sistema"
    type Mutation {
        "Mutations de Usuario"
        nuevoUsuario(input: UsuarioInput!): Usuario
        autenticarUsuario(input: AutenticarInput!): Token
        actualizarUsuario(id: ID!, input: ActualizarUsuarioInput!): Usuario
        
        "Mutations de Wallet"
        depositarSaldo(monto: Float!): Usuario
        retirarSaldo(monto: Float!): Usuario
        bloquearSaldo(monto: Float!): Usuario
        desbloquearSaldo(monto: Float!): Usuario

        "Mutations de Categoría"
        nuevaCategoria(input: CategoriaInput!): Categoria
        actualizarCategoria(id: ID!, input: ActualizarCategoriaInput!): Categoria
        eliminarCategoria(id: ID!): String

        "Mutations de Producto"
        nuevoProducto(input: ProductoInput!): Producto
        actualizarProducto(id: ID!, input: ActualizarProductoInput!): Producto
        eliminarProducto(id: ID!): String
        incrementarVisitas(id: ID!): Producto

        "Mutations de Subasta"
        nuevaSubasta(input: SubastaInput!): Subasta
        actualizarSubasta(id: ID!, input: ActualizarSubastaInput!): Subasta
        cancelarSubasta(id: ID!): String
        finalizarSubasta(id: ID!, ganadorId: ID!): Subasta

        "Mutations de Puja"
        crearPuja(input: PujaInput!): Puja
        actualizarEstadoPuja(id: ID!, estado: EstadoPuja!): Puja

        "Mutations de Venta"
        crearVenta(input: VentaInput!): Venta
        actualizarEstadoVenta(id: ID!, estado: EstadoVenta!): Venta

        "Mutations de Pago"
        crearPago(input: PagoInput!): Pago
        actualizarEstadoPago(id: ID!, estado: EstadoPago!): Pago

        "Mutations de Envío"
        crearEnvio(input: EnvioInput!): Envio
        actualizarEstadoEnvio(id: ID!, estado: EstadoEnvio!): Envio
        actualizarTracking(id: ID!, tracking: String!): Envio

        "Mutations de Favorito"
        agregarFavorito(input: FavoritoInput!): Favorito
        eliminarFavorito(productoId: ID!): String

        "Mutations de Mensaje"
        enviarMensaje(input: MensajeInput!): Mensaje
        marcarMensajeComoLeido(id: ID!): Mensaje
        eliminarMensaje(id: ID!): String

        "Mutations de Notificación"
        crearNotificacion(input: NotificacionInput!): Notificacion
        marcarNotificacionComoLeida(id: ID!): Notificacion
        marcarTodasNotificacionesComoLeidas: String
        eliminarNotificacion(id: ID!): String

        "Mutations de Valoración"
        crearValoracion(input: ValoracionInput!): Valoracion
        actualizarValoracion(id: ID!, input: ValoracionInput!): Valoracion
        eliminarValoracion(id: ID!): String
    }
`;

module.exports = typeDefs;