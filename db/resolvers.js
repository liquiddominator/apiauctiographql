const mongoose = require('mongoose');
const { Usuario } = require('../models/Usuario');
const { Categoria } = require('../models/Categoria');
const { Producto } = require('../models/Producto');
const { Subasta } = require('../models/Subasta');
const { Puja } = require('../models/Puja');
const { Venta } = require('../models/Venta');
const { Pago } = require('../models/Pago');
const { Envio } = require('../models/Envio');
const { Favorito } = require('../models/Favorito');
const { Mensaje } = require('../models/Mensaje');
const { Notificacion } = require('../models/Notificacion');
const { Valoracion } = require('../models/Valoracion');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: 'variables.env'});
const jwt = require('jsonwebtoken');

const crearToken = (usuario, palabraSecreta, expiresIn) => {
    const { id, username, email, estado, wallet } = usuario;
    const walletString = {
        saldo: wallet.saldo.toString(),        // Necesario para JWT
        saldoBloqueado: wallet.saldoBloqueado.toString()  // Necesario para JWT
    };
    return jwt.sign({ id, username, email, estado, wallet: walletString }, palabraSecreta, { expiresIn });
};

const manejarError = (mensaje, codigo = 400) => {
    const error = new Error(mensaje);
    error.codigo = codigo;
    throw error;
};


// Helper función para transformar el documento de usuario
const transformarUsuario = (usuario) => {
    if (!usuario) return null;
    return {
        ...usuario._doc,
        id: usuario._id,
        wallet: {
            saldo: Number(usuario.wallet.saldo),
            saldoBloqueado: Number(usuario.wallet.saldoBloqueado)
        }
    };
};
// Helper para transformar los valores decimales
const transformarSubasta = (subasta) => {
    if (!subasta) return null;
    return {
        ...subasta._doc,
        id: subasta._id,
        precioInicial: Number(subasta.precioInicial),
        precioActual: subasta.precioActual ? Number(subasta.precioActual) : null,
        incrementoMinimo: subasta.incrementoMinimo ? Number(subasta.incrementoMinimo) : null,
        precioReserva: subasta.precioReserva ? Number(subasta.precioReserva) : null,
        vendedor: subasta.vendedorId,
        producto: subasta.productoId || null,
        ganador: subasta.ganadorId
    };
};

const transformarProducto = (producto) => {
    if (!producto) return null;
    return {
        ...producto._doc,
        id: producto._id,
        vendedor: producto.vendedorId,
        precio: Number(producto.precio)
    };
};
const transformarPuja = (puja) => {
    if (!puja) return null;
    return {
        ...puja._doc,
        id: puja._id,
        monto: Number(puja.monto),
        subasta: transformarSubasta(puja.subastaId),
        usuario: puja.usuarioId
    };
};
// Helper para transformar los valores decimales de venta
const transformarVenta = (venta) => {
    if (!venta) return null;
    return {
        ...venta._doc,
        id: venta._id,
        monto: Number(venta.monto),
        fecha: venta.fecha.toISOString(),
        producto: venta.productoId,
        subasta: venta.subastaId,
        vendedor: venta.vendedorId,
        comprador: venta.compradorId
    };
};
// Helper para transformar los valores decimales de pago
const transformarPago = (pago) => {
    if (!pago) return null;
    return {
        ...pago._doc,
        id: pago._id,
        monto: Number(pago.monto),
        venta: pago.ventaId,
        fecha: pago.fecha?.toISOString()
    };
};
// Helper functions
const transformarEnvio = (envio) => {
    if (!envio) return null;
    return {
        ...envio._doc,
        id: envio._id,
        fechaEnvio: envio.fechaEnvio?.toISOString(),
        fechaEntrega: envio.fechaEntrega?.toISOString(),
        venta: envio.ventaId
    };
};

const transformarFavorito = (favorito) => {
    if (!favorito) return null;
    return {
        ...favorito._doc,
        id: favorito._id,
        fecha: favorito.fecha.toISOString(),
        usuario: favorito.usuarioId,
        producto: favorito.productoId
    };
};

const transformarMensaje = (mensaje) => {
    if (!mensaje) return null;
    return {
        ...mensaje._doc,
        id: mensaje._id,
        fecha: mensaje.fecha.toISOString(),
        emisor: mensaje.emisorId,
        receptor: mensaje.receptorId,
        producto: mensaje.productoId
    };
};

const transformarNotificacion = (notificacion) => {
    if (!notificacion) return null;
    return {
        ...notificacion._doc,
        id: notificacion._id,
        fecha: notificacion.fecha.toISOString(),
        usuario: notificacion.usuarioId
    };
};

const transformarValoracion = (valoracion) => {
    if (!valoracion) return null;
    return {
        ...valoracion._doc,
        id: valoracion._id,
        fecha: valoracion.fecha.toISOString(),
        vendedor: valoracion.vendedorId,
        comprador: valoracion.compradorId,
        venta: valoracion.ventaId
    };
};

const resolvers = {
    Query: {
        obtenerUsuario: async (_, { token }) => {
            const decoded = jwt.verify(token, process.env.FIRMA_SECRETA);
            return decoded;
        },

        obtenerPerfilUsuario: async (_, { id }) => {
            try {
                const usuario = await Usuario.findById(id);
                if (!usuario) {
                    throw new Error('Usuario no encontrado');
                }
                return transformarUsuario(usuario);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerUsuarios: async () => {
            try {
                const usuarios = await Usuario.find({});
                return usuarios.map(usuario => transformarUsuario(usuario));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerCategorias: async () => {
            try {
                const categorias = await Categoria.find({});
                return categorias;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerCategoria: async (_, { id }) => {
            try {
                const categoria = await Categoria.findById(id);
                if (!categoria) {
                    throw new Error('Categoría no encontrada');
                }
                return categoria;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerCategoriasActivas: async () => {
            try {
                const categorias = await Categoria.find({ estado: 'activa' });
                return categorias;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerProductos: async () => {
            try {
                const productos = await Producto.find().populate('vendedorId');
                return productos.map(producto => transformarProducto(producto));  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerProducto: async (_, { id }) => {
            try {
                const producto = await Producto.findById(id).populate('vendedorId');
                if (!producto) {
                    throw new Error('Producto no encontrado');
                }
                return transformarProducto(producto);  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerProductosPorVendedor: async (_, { vendedorId }) => {
            try {
                const productos = await Producto.find({ vendedorId }).populate('vendedorId');
                return productos.map(producto => transformarProducto(producto));  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerProductosPorCategoria: async (_, { categoria }) => {
            try {
                const productos = await Producto.find({ categoria }).populate('vendedorId');
                return productos.map(producto => transformarProducto(producto));  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerProductosActivos: async () => {
            try {
                const productos = await Producto.find({ estado: 'activo' }).populate('vendedorId');
                return productos.map(producto => transformarProducto(producto));  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerSubastas: async () => {
            try {
                const subastas = await Subasta.find()
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');
                return subastas.map(subasta => transformarSubasta(subasta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerSubasta: async (_, { id }) => {
            try {
                const subasta = await Subasta.findById(id)
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');
                if (!subasta) {
                    throw new Error('Subasta no encontrada');
                }
                return transformarSubasta(subasta);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerSubastasActivas: async () => {
            try {
                const subastas = await Subasta.find({ estado: 'activa' })
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');
                return subastas.map(subasta => transformarSubasta(subasta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerSubastasPorVendedor: async (_, { vendedorId }) => {
            try {
                const subastas = await Subasta.find({ vendedorId })
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');
                return subastas.map(subasta => transformarSubasta(subasta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerSubastasPorGanador: async (_, { ganadorId }) => {
            try {
                const subastas = await Subasta.find({
                    ganadorId,
                    estado: 'finalizada'
                })
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');
                return subastas.map(subasta => transformarSubasta(subasta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPujas: async () => {
            try {
                const pujas = await Puja.find()
                    .populate('subastaId')
                    .populate('usuarioId');
                return pujas.map(puja => transformarPuja(puja));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPuja: async (_, { id }) => {
            try {
                const puja = await Puja.findById(id)
                    .populate('subastaId')
                    .populate('usuarioId');
                if (!puja) {
                    throw new Error('Puja no encontrada');
                }
                return transformarPuja(puja);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPujasPorSubasta: async (_, { subastaId }) => {
            try {
                const pujas = await Puja.find({ subastaId })
                    .populate('subastaId')
                    .populate('usuarioId')
                    .sort({ monto: -1 });
                return pujas.map(puja => transformarPuja(puja));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVentas: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventas = await Venta.find()
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                return ventas.map(venta => transformarVenta(venta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVenta: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const venta = await Venta.findById(id)
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                if (!venta) {
                    throw new Error('Venta no encontrada');
                }
                return transformarVenta(venta);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVentasPorVendedor: async (_, { vendedorId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventas = await Venta.find({ vendedorId })
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                return ventas.map(venta => transformarVenta(venta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVentasPorComprador: async (_, { compradorId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventas = await Venta.find({ compradorId })
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                return ventas.map(venta => transformarVenta(venta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVentasPorProducto: async (_, { productoId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventas = await Venta.find({ productoId })
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                return ventas.map(venta => transformarVenta(venta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerVentasPorSubasta: async (_, { subastaId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventas = await Venta.find({ subastaId })
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');
                return ventas.map(venta => transformarVenta(venta));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPagos: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pagos = await Pago.find().populate('ventaId');
                return pagos.map(pago => transformarPago(pago));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPago: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pago = await Pago.findById(id).populate('ventaId');
                if (!pago) {
                    throw new Error('Pago no encontrado');
                }
                return transformarPago(pago);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPagosPorVenta: async (_, { ventaId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pagos = await Pago.find({ ventaId }).populate('ventaId');
                return pagos.map(pago => transformarPago(pago));
            } catch (error) {
                throw new Error(error.message);
            }
        },

        obtenerPujasPorUsuario: async (_, { usuarioId }) => {
            try {
                const pujas = await Puja.find({ usuarioId })
                    .populate('subastaId')
                    .populate('usuarioId');
                return pujas.map(puja => transformarPuja(puja));
            } catch (error) {
                throw new Error(error.message);
            }
        },
        obtenerEnvios: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const envios = await Envio.find().populate('ventaId');
            return envios.map(transformarEnvio);
        },

        obtenerEnvio: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const envio = await Envio.findById(id).populate('ventaId');
            if (!envio) throw new Error('Envío no encontrado');
            return transformarEnvio(envio);
        },

        obtenerEnviosPorVenta: async (_, { ventaId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const envios = await Envio.find({ ventaId }).populate('ventaId');
            return envios.map(transformarEnvio);
        },

        obtenerFavoritos: async (_, { usuarioId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const favoritos = await Favorito.find({ usuarioId })
                .populate('usuarioId')
                .populate('productoId');
            return favoritos.map(transformarFavorito);
        },

        obtenerFavoritosPorProducto: async (_, { productoId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const favoritos = await Favorito.find({ productoId })
                .populate('usuarioId')
                .populate('productoId');
            return favoritos.map(transformarFavorito);
        },

        // Mensajes Queries
        obtenerMensajes: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajes = await Mensaje.find({
                $or: [
                    { emisorId: ctx.usuario.id },
                    { receptorId: ctx.usuario.id }
                ]
            })
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId')
                .sort({ fecha: -1 });
            return mensajes.map(transformarMensaje);
        },

        obtenerMensajesEnviados: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajes = await Mensaje.find({ emisorId: ctx.usuario.id })
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId')
                .sort({ fecha: -1 });
            return mensajes.map(transformarMensaje);
        },

        obtenerMensajesRecibidos: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajes = await Mensaje.find({ receptorId: ctx.usuario.id })
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId')
                .sort({ fecha: -1 });
            return mensajes.map(transformarMensaje);
        },

        obtenerMensajesPorProducto: async (_, { productoId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajes = await Mensaje.find({
                productoId,
                $or: [
                    { emisorId: ctx.usuario.id },
                    { receptorId: ctx.usuario.id }
                ]
            })
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId')
                .sort({ fecha: -1 });
            return mensajes.map(transformarMensaje);
        },

        obtenerConversacion: async (_, { usuarioId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajes = await Mensaje.find({
                $or: [
                    { emisorId: ctx.usuario.id, receptorId: usuarioId },
                    { emisorId: usuarioId, receptorId: ctx.usuario.id }
                ]
            })
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId')
                .sort({ fecha: -1 });
            return mensajes.map(transformarMensaje);
        },

        obtenerNotificaciones: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const notificaciones = await Notificacion.find({ usuarioId: ctx.usuario.id })
                .populate('usuarioId')
                .sort({ fecha: -1 });
            return notificaciones.map(transformarNotificacion);
        },

        obtenerNotificacionesNoLeidas: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const notificaciones = await Notificacion.find({
                usuarioId: ctx.usuario.id,
                leida: false
            })
                .populate('usuarioId')
                .sort({ fecha: -1 });
            return notificaciones.map(transformarNotificacion);
        },

        obtenerNotificacionesPorTipo: async (_, { tipo }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const notificaciones = await Notificacion.find({
                usuarioId: ctx.usuario.id,
                tipo
            })
                .populate('usuarioId')
                .sort({ fecha: -1 });
            return notificaciones.map(transformarNotificacion);
        },

        obtenerValoraciones: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoraciones = await Valoracion.find()
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId')
                .sort({ fecha: -1 });
            return valoraciones.map(transformarValoracion);
        },

        obtenerValoracionesPorVendedor: async (_, { vendedorId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoraciones = await Valoracion.find({ vendedorId })
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId')
                .sort({ fecha: -1 });
            return valoraciones.map(transformarValoracion);
        },

        obtenerValoracionesPorComprador: async (_, { compradorId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoraciones = await Valoracion.find({ compradorId })
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId')
                .sort({ fecha: -1 });
            return valoraciones.map(transformarValoracion);
        },

        obtenerValoracionPorVenta: async (_, { ventaId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoracion = await Valoracion.findOne({ ventaId })
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId');
            return transformarValoracion(valoracion);
        }
    },

    Mutation: {
        nuevoUsuario: async (_, { input }) => {
            const { email, username, password } = input;

            const existeUsuario = await Usuario.findOne({
                $or: [{ email }, { username }]
            });

            if (existeUsuario) {
                throw new Error('Usuario o email ya registrado');
            }

            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(password, salt);

            input.estado = 'activo';
            input.wallet = {
                saldo: new mongoose.Types.Decimal128('0'),
                saldoBloqueado: new mongoose.Types.Decimal128('0')
            };
            input.fechaRegistro = new Date();

            try {
                const usuario = new Usuario(input);
                const usuarioGuardado = await usuario.save();
                return transformarUsuario(usuarioGuardado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            const usuario = await Usuario.findOne({ email });
            if (!usuario) {
                throw new Error(`Usuario con email ${email} no existe`);
            }

            if (usuario.estado !== 'activo') {
                throw new Error('Usuario no activo');
            }

            const passwordCorrecto = await bcrypt.compare(password, usuario.password);
            if (!passwordCorrecto) {
                throw new Error('Password incorrecto');
            }

            return {
                token: crearToken(usuario, process.env.FIRMA_SECRETA, '24h')
            };
        },

        actualizarUsuario: async (_, { id, input }, ctx) => {
            let usuario = await Usuario.findById(id);
            if (!usuario) {
                throw new Error('Usuario no existe');
            }

            const actualizacion = {};

            if (input.username) actualizacion.username = input.username;
            if (input.email) actualizacion.email = input.email;
            if (input.nombre) actualizacion.nombre = input.nombre;
            if (input.telefono) actualizacion.telefono = input.telefono;
            if (input.estado) actualizacion.estado = input.estado;

            if (input.password) {
                const salt = await bcrypt.genSalt(10);
                actualizacion.password = await bcrypt.hash(input.password, salt);
            }

            if (input.direccion) {
                actualizacion.direccion = {};
                if (input.direccion.calle) actualizacion.direccion.calle = input.direccion.calle;
                if (input.direccion.ciudad) actualizacion.direccion.ciudad = input.direccion.ciudad;
                if (input.direccion.codigoPostal) actualizacion.direccion.codigoPostal = input.direccion.codigoPostal;
            }

            if (input.wallet) {
                actualizacion.wallet = {
                    saldo: new mongoose.Types.Decimal128(input.wallet.saldo.toString()),
                    saldoBloqueado: new mongoose.Types.Decimal128(input.wallet.saldoBloqueado.toString())
                };
            }

            try {
                usuario = await Usuario.findOneAndUpdate(
                    { _id: id },
                    { $set: actualizacion },
                    { new: true }
                );
                return transformarUsuario(usuario);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        depositarSaldo: async (_, { monto }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);

            try {
                const usuario = await Usuario.findById(ctx.usuario.id);
                if (!usuario) throw new Error('Usuario no encontrado');

                const saldoActual = Number(usuario.wallet.saldo);
                // Convertimos el resultado a string al crear el Decimal128
                const nuevoSaldo = new mongoose.Types.Decimal128((saldoActual + monto).toString());

                const usuarioActualizado = await Usuario.findOneAndUpdate(
                    { _id: ctx.usuario.id },
                    {
                        $set: {
                            'wallet.saldo': nuevoSaldo
                        }
                    },
                    { new: true }
                );

                return transformarUsuario(usuarioActualizado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        retirarSaldo: async (_, { monto }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);

            try {
                const usuario = await Usuario.findById(ctx.usuario.id);
                if (!usuario) throw new Error('Usuario no encontrado');

                const saldoActual = Number(usuario.wallet.saldo);
                if (saldoActual < monto) {
                    throw new Error('Saldo insuficiente');
                }

                const nuevoSaldo = new mongoose.Types.Decimal128((saldoActual - monto).toString());

                const usuarioActualizado = await Usuario.findOneAndUpdate(
                    { _id: ctx.usuario.id },
                    {
                        $set: {
                            'wallet.saldo': nuevoSaldo
                        }
                    },
                    { new: true }
                );

                return transformarUsuario(usuarioActualizado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        bloquearSaldo: async (_, { monto }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);

            try {
                const usuario = await Usuario.findById(ctx.usuario.id);
                if (!usuario) throw new Error('Usuario no encontrado');

                const saldoActual = Number(usuario.wallet.saldo);
                const saldoBloqueadoActual = Number(usuario.wallet.saldoBloqueado);

                if (saldoActual < monto) {
                    throw new Error('Saldo insuficiente para bloquear');
                }

                const nuevoSaldo = new mongoose.Types.Decimal128((saldoActual - monto).toString());
                const nuevoSaldoBloqueado = new mongoose.Types.Decimal128((saldoBloqueadoActual + monto).toString());

                const usuarioActualizado = await Usuario.findOneAndUpdate(
                    { _id: ctx.usuario.id },
                    {
                        $set: {
                            'wallet.saldo': nuevoSaldo,
                            'wallet.saldoBloqueado': nuevoSaldoBloqueado
                        }
                    },
                    { new: true }
                );

                return transformarUsuario(usuarioActualizado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        desbloquearSaldo: async (_, { monto }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);

            try {
                const usuario = await Usuario.findById(ctx.usuario.id);
                if (!usuario) throw new Error('Usuario no encontrado');

                const saldoActual = Number(usuario.wallet.saldo);
                const saldoBloqueadoActual = Number(usuario.wallet.saldoBloqueado);

                if (saldoBloqueadoActual < monto) {
                    throw new Error('Saldo bloqueado insuficiente');
                }

                const nuevoSaldo = new mongoose.Types.Decimal128((saldoActual + monto).toString());
                const nuevoSaldoBloqueado = new mongoose.Types.Decimal128((saldoBloqueadoActual - monto).toString());

                const usuarioActualizado = await Usuario.findOneAndUpdate(
                    { _id: ctx.usuario.id },
                    {
                        $set: {
                            'wallet.saldo': nuevoSaldo,
                            'wallet.saldoBloqueado': nuevoSaldoBloqueado
                        }
                    },
                    { new: true }
                );

                return transformarUsuario(usuarioActualizado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        nuevaCategoria: async (_, { input }) => {
            try {
                // Verificar si ya existe una categoría con el mismo nombre
                const existeCategoria = await Categoria.findOne({ nombre: input.nombre });
                if (existeCategoria) {
                    throw new Error(`La categoría ${input.nombre} ya existe`);
                }

                const categoria = new Categoria(input);
                const resultado = await categoria.save();
                return resultado;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarCategoria: async (_, { id, input }) => {
            try {
                // Verificar si la categoría existe
                let categoria = await Categoria.findById(id);
                if (!categoria) {
                    throw new Error('Categoría no encontrada');
                }

                // Si se está actualizando el nombre, verificar que no exista
                if (input.nombre) {
                    const existeCategoria = await Categoria.findOne({
                        nombre: input.nombre,
                        _id: { $ne: id }
                    });
                    if (existeCategoria) {
                        throw new Error(`La categoría ${input.nombre} ya existe`);
                    }
                }

                // Actualizar solo los campos proporcionados
                const actualizacion = {};
                if (input.nombre) actualizacion.nombre = input.nombre;
                if (input.descripcion !== undefined) actualizacion.descripcion = input.descripcion;
                if (input.imagen !== undefined) actualizacion.imagen = input.imagen;
                if (input.estado) actualizacion.estado = input.estado;

                categoria = await Categoria.findOneAndUpdate(
                    { _id: id },
                    { $set: actualizacion },
                    { new: true }
                );

                return categoria;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        eliminarCategoria: async (_, { id }) => {
            try {
                // Verificar si la categoría existe
                const categoria = await Categoria.findById(id);
                if (!categoria) {
                    throw new Error('Categoría no encontrada');
                }

                // En lugar de eliminar, podrías cambiar el estado a inactiva
                await Categoria.findOneAndUpdate(
                    { _id: id },
                    { estado: 'inactiva' }
                );

                return "Categoría desactivada correctamente";
            } catch (error) {
                throw new Error(error.message);
            }
        },

        nuevoProducto: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const producto = new Producto({
                    ...input,
                    vendedorId: ctx.usuario.id,
                    estado: 'activo',
                    visitas: 0,
                    precio: new mongoose.Types.Decimal128(input.precio.toString())
                });

                const resultado = await producto.save();
                await resultado.populate('vendedorId');

                return transformarProducto(resultado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarProducto: async (_, { id, input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                let producto = await Producto.findById(id);

                if (!producto) {
                    throw new Error('Producto no encontrado');
                }

                if (producto.vendedorId.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado para modificar este producto');
                }

                const actualizacion = {};
                if (input.titulo) actualizacion.titulo = input.titulo;
                if (input.descripcion !== undefined) actualizacion.descripcion = input.descripcion;
                if (input.categoria) actualizacion.categoria = input.categoria;
                if (input.subcategoria !== undefined) actualizacion.subcategoria = input.subcategoria;
                if (input.precio) actualizacion.precio = new mongoose.Types.Decimal128(input.precio.toString());
                if (input.imagenes) actualizacion.imagenes = input.imagenes;
                if (input.estado) actualizacion.estado = input.estado;
                if (input.condicion) actualizacion.condicion = input.condicion;

                producto = await Producto.findOneAndUpdate(
                    { _id: id },
                    { $set: actualizacion },
                    { new: true }
                ).populate('vendedorId');

                return transformarProducto(producto);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        eliminarProducto: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const producto = await Producto.findById(id);

                if (!producto) {
                    throw new Error('Producto no encontrado');
                }

                // Verificar si el usuario es el vendedor
                if (producto.vendedorId.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado para eliminar este producto');
                }

                await Producto.findOneAndUpdate(
                    { _id: id },
                    { estado: 'cancelado' }
                );

                return "Producto cancelado correctamente";
            } catch (error) {
                throw new Error(error.message);
            }
        },

        incrementarVisitas: async (_, { id }) => {
            try {
                const producto = await Producto.findOneAndUpdate(
                    { _id: id },
                    { $inc: { visitas: 1 } },
                    { new: true }
                ).populate('vendedorId');

                if (!producto) {
                    throw new Error('Producto no encontrado');
                }

                return transformarProducto(producto);  // Usar el transformer
            } catch (error) {
                throw new Error(error.message);
            }
        },

        nuevaSubasta: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const nuevaSubasta = new Subasta({
                    ...input,
                    vendedorId: ctx.usuario.id,
                    estado: 'activa',
                    cantidadPujas: 0,
                    precioActual: new mongoose.Types.Decimal128(input.precioInicial.toString()),
                    precioInicial: new mongoose.Types.Decimal128(input.precioInicial.toString()),
                    incrementoMinimo: new mongoose.Types.Decimal128(input.incrementoMinimo.toString()),
                    precioReserva: input.precioReserva ?
                        new mongoose.Types.Decimal128(input.precioReserva.toString()) : undefined,
                    fechaInicio: new Date(input.fechaInicio),
                    fechaFin: new Date(input.fechaFin)
                });

                const subastaGuardada = await nuevaSubasta.save();
                const subastaPopulada = await Subasta.findById(subastaGuardada._id)
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');

                return transformarSubasta(subastaPopulada);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarSubasta: async (_, { id, input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                let subasta = await Subasta.findById(id);
                if (!subasta) {
                    throw new Error('Subasta no encontrada');
                }

                // Verificar si el usuario es el vendedor
                if (subasta.vendedorId.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado para modificar esta subasta');
                }

                // Verificar que la subasta no haya iniciado
                if (subasta.estado == 'activa') {
                    throw new Error('No se puede modificar una subasta que ya ha iniciado');
                }

                const actualizacion = {};
                if (input.precioInicial) actualizacion.precioInicial = new mongoose.Types.Decimal128(input.precioInicial.toString());
                if (input.incrementoMinimo) actualizacion.incrementoMinimo = new mongoose.Types.Decimal128(input.incrementoMinimo.toString());
                if (input.precioReserva) actualizacion.precioReserva = new mongoose.Types.Decimal128(input.precioReserva.toString());
                if (input.fechaInicio) actualizacion.fechaInicio = new Date(input.fechaInicio);
                if (input.fechaFin) actualizacion.fechaFin = new Date(input.fechaFin);
                if (input.estado) actualizacion.estado = input.estado;

                subasta = await Subasta.findOneAndUpdate(
                    { _id: id },
                    { $set: actualizacion },
                    { new: true }
                )
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');

                return transformarSubasta(subasta);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        cancelarSubasta: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const subasta = await Subasta.findById(id);
                if (!subasta) {
                    throw new Error('Subasta no encontrada');
                }

                if (subasta.vendedorId.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado para cancelar esta subasta');
                }

                await Subasta.findOneAndUpdate(
                    { _id: id },
                    { estado: 'cancelada' }
                );

                return "Subasta cancelada correctamente";
            } catch (error) {
                throw new Error(error.message);
            }
        },

        finalizarSubasta: async (_, { id, ganadorId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                let subasta = await Subasta.findById(id);
                if (!subasta) {
                    throw new Error('Subasta no encontrada');
                }

                if (subasta.vendedorId.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado para finalizar esta subasta');
                }

                if (subasta.estado !== 'activa') {
                    throw new Error('La subasta ya no está activa');
                }

                subasta = await Subasta.findOneAndUpdate(
                    { _id: id },
                    {
                        estado: 'finalizada',
                        ganadorId
                    },
                    { new: true }
                )
                    .populate('productoId')
                    .populate('vendedorId')
                    .populate('ganadorId');

                return transformarSubasta(subasta);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        crearPuja: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const subasta = await Subasta.findById(input.subastaId);
                if (!subasta) {
                    throw new Error('Subasta no encontrada');
                }
                if (subasta.estado !== 'activa') {
                    throw new Error('La subasta no está activa');
                }
                if (new Date() < new Date(subasta.fechaInicio) || new Date() > new Date(subasta.fechaFin)) {
                    throw new Error('La subasta no está en su periodo de actividad');
                }

                const montoNuevo = new mongoose.Types.Decimal128(input.monto.toString());
                const precioActual = Number(subasta.precioActual);
                const incrementoMinimo = Number(subasta.incrementoMinimo);

                if (Number(montoNuevo) <= precioActual) {
                    throw new Error('El monto debe ser mayor que la puja actual');
                }

                const diferencia = Number(montoNuevo) - precioActual;
                if (diferencia < incrementoMinimo) {
                    throw new Error('El incremento debe ser mayor al mínimo establecido');
                }

                const puja = new Puja({
                    subastaId: input.subastaId,
                    usuarioId: ctx.usuario.id,
                    monto: montoNuevo,
                    estado: 'activa',
                    fecha: new Date()
                });

                const pujaGuardada = await puja.save();
                await Subasta.findOneAndUpdate(
                    { _id: input.subastaId },
                    {
                        precioActual: montoNuevo,
                        $inc: { cantidadPujas: 1 }
                    }
                );

                await Puja.updateMany(
                    {
                        subastaId: input.subastaId,
                        estado: 'activa',
                        _id: { $ne: pujaGuardada._id }
                    },
                    { estado: 'superada' }
                );

                const pujaPopulada = await Puja.findById(pujaGuardada._id)
                    .populate({
                        path: 'subastaId',
                        populate: [
                            { path: 'productoId' },
                            { path: 'vendedorId' },
                            { path: 'ganadorId' }
                        ]
                    })
                    .populate('usuarioId');

                return transformarPuja(pujaPopulada);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarEstadoPuja: async (_, { id, estado }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pujaActualizada = await Puja.findOneAndUpdate(
                    { _id: id },
                    { estado },
                    { new: true }
                )
                    .populate('subastaId')
                    .populate('usuarioId');

                if (!pujaActualizada) {
                    throw new Error('Puja no encontrada');
                }

                return transformarPuja(pujaActualizada);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        crearVenta: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const venta = new Venta({
                    ...input,
                    vendedorId: ctx.usuario.id,
                    monto: new mongoose.Types.Decimal128(input.monto.toString()),
                    estado: 'pendiente',
                    fecha: new Date()
                });

                const ventaGuardada = await venta.save();
                const ventaPopulada = await Venta.findById(ventaGuardada._id)
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');

                return transformarVenta(ventaPopulada);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarEstadoVenta: async (_, { id, estado }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const ventaActualizada = await Venta.findOneAndUpdate(
                    { _id: id },
                    { estado },
                    { new: true }
                )
                    .populate('productoId')
                    .populate('subastaId')
                    .populate('vendedorId')
                    .populate('compradorId');

                if (!ventaActualizada) {
                    throw new Error('Venta no encontrada');
                }

                return transformarVenta(ventaActualizada);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        crearPago: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pago = new Pago({
                    ...input,
                    monto: new mongoose.Types.Decimal128(input.monto.toString()),
                    estado: 'pendiente',
                    fecha: new Date()
                });

                const pagoGuardado = await pago.save();
                const pagoPopulado = await Pago.findById(pagoGuardado._id)
                    .populate('ventaId');

                return transformarPago(pagoPopulado);
            } catch (error) {
                throw new Error(error.message);
            }
        },

        actualizarEstadoPago: async (_, { id, estado }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            try {
                const pagoActualizado = await Pago.findOneAndUpdate(
                    { _id: id },
                    { estado },
                    { new: true }
                ).populate('ventaId');

                if (!pagoActualizado) {
                    throw new Error('Pago no encontrado');
                }

                return transformarPago(pagoActualizado);
            } catch (error) {
                throw new Error(error.message);
            }
        },
        crearEnvio: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const envio = new Envio({
                ...input,
                estado: 'pendiente'
            });

            const envioGuardado = await envio.save();
            const envioPopulado = await Envio.findById(envioGuardado._id)
                .populate('ventaId');

            return transformarEnvio(envioPopulado);
        },

        actualizarEstadoEnvio: async (_, { id, estado }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const actualizacion = {
                estado,
                ...(estado === 'enviado' && { fechaEnvio: new Date() }),
                ...(estado === 'entregado' && { fechaEntrega: new Date() })
            };

            const envioActualizado = await Envio.findOneAndUpdate(
                { _id: id },
                actualizacion,
                { new: true }
            ).populate('ventaId');

            if (!envioActualizado) throw new Error('Envío no encontrado');
            return transformarEnvio(envioActualizado);
        },

        actualizarTracking: async (_, { id, tracking }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const envioActualizado = await Envio.findOneAndUpdate(
                { _id: id },
                { tracking },
                { new: true }
            ).populate('ventaId');

            if (!envioActualizado) throw new Error('Envío no encontrado');
            return transformarEnvio(envioActualizado);
        },

        // Favoritos Mutations
        agregarFavorito: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const favoritoExistente = await Favorito.findOne({
                usuarioId: ctx.usuario.id,
                productoId: input.productoId
            });

            if (favoritoExistente) throw new Error('Este producto ya está en favoritos');

            const favorito = new Favorito({
                usuarioId: ctx.usuario.id,
                productoId: input.productoId
            });

            const favoritoGuardado = await favorito.save();
            const favoritoPopulado = await Favorito.findById(favoritoGuardado._id)
                .populate('usuarioId')
                .populate('productoId');

            return transformarFavorito(favoritoPopulado);
        },

        eliminarFavorito: async (_, { productoId }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const favorito = await Favorito.findOneAndDelete({
                usuarioId: ctx.usuario.id,
                productoId
            });

            if (!favorito) throw new Error('Favorito no encontrado');
            return "Favorito eliminado correctamente";
        },

        // Mensajes Mutations
        enviarMensaje: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensaje = new Mensaje({
                ...input,
                emisorId: ctx.usuario.id,
                leido: false
            });

            const mensajeGuardado = await mensaje.save();
            const mensajePopulado = await Mensaje.findById(mensajeGuardado._id)
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId');

            return transformarMensaje(mensajePopulado);
        },

        marcarMensajeComoLeido: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensajeActualizado = await Mensaje.findOneAndUpdate(
                { _id: id, receptorId: ctx.usuario.id },
                { leido: true },
                { new: true }
            )
                .populate('emisorId')
                .populate('receptorId')
                .populate('productoId');

            if (!mensajeActualizado) throw new Error('Mensaje no encontrado');
            return transformarMensaje(mensajeActualizado);
        },

        eliminarMensaje: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const mensaje = await Mensaje.findOneAndDelete({
                _id: id,
                emisorId: ctx.usuario.id
            });

            if (!mensaje) throw new Error('Mensaje no encontrado');
            return "Mensaje eliminado correctamente";
        },
        crearNotificacion: async (_, { input }) => {
            const notificacion = new Notificacion({
                ...input,
                leida: false
            });

            const notificacionGuardada = await notificacion.save();
            const notificacionPopulada = await Notificacion.findById(notificacionGuardada._id)
                .populate('usuarioId');

            return transformarNotificacion(notificacionPopulada);
        },

        marcarNotificacionComoLeida: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const notificacionActualizada = await Notificacion.findOneAndUpdate(
                { _id: id, usuarioId: ctx.usuario.id },
                { leida: true },
                { new: true }
            ).populate('usuarioId');

            if (!notificacionActualizada) throw new Error('Notificación no encontrada');
            return transformarNotificacion(notificacionActualizada);
        },

        marcarTodasNotificacionesComoLeidas: async (_, __, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            await Notificacion.updateMany(
                { usuarioId: ctx.usuario.id, leida: false },
                { leida: true }
            );

            return "Todas las notificaciones han sido marcadas como leídas";
        },

        eliminarNotificacion: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const notificacion = await Notificacion.findOneAndDelete({
                _id: id,
                usuarioId: ctx.usuario.id
            });

            if (!notificacion) throw new Error('Notificación no encontrada');
            return "Notificación eliminada correctamente";
        },

        // Valoraciones Mutations
        crearValoracion: async (_, { input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            // Verificar que la venta existe y pertenece al comprador
            const venta = await Venta.findById(input.ventaId);
            if (!venta) throw new Error('Venta no encontrada');
            if (venta.compradorId.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado para valorar esta venta');
            }

            // Verificar que no existe una valoración previa
            const valoracionExistente = await Valoracion.findOne({ ventaId: input.ventaId });
            if (valoracionExistente) {
                throw new Error('Ya existe una valoración para esta venta');
            }

            const valoracion = new Valoracion({
                ...input,
                compradorId: ctx.usuario.id,
                vendedorId: venta.vendedorId
            });

            const valoracionGuardada = await valoracion.save();
            const valoracionPopulada = await Valoracion.findById(valoracionGuardada._id)
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId');

            return transformarValoracion(valoracionPopulada);
        },

        actualizarValoracion: async (_, { id, input }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoracion = await Valoracion.findById(id);
            if (!valoracion) throw new Error('Valoración no encontrada');

            if (valoracion.compradorId.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado para modificar esta valoración');
            }

            const valoracionActualizada = await Valoracion.findOneAndUpdate(
                { _id: id },
                {
                    puntuacion: input.puntuacion,
                    comentario: input.comentario
                },
                { new: true }
            )
                .populate('vendedorId')
                .populate('compradorId')
                .populate('ventaId');

            return transformarValoracion(valoracionActualizada);
        },

        eliminarValoracion: async (_, { id }, ctx) => {
            if (!ctx.usuario) manejarError('No autenticado', 401);
            const valoracion = await Valoracion.findOne({
                _id: id,
                compradorId: ctx.usuario.id
            });

            if (!valoracion) throw new Error('Valoración no encontrada');

            await Valoracion.findByIdAndDelete(id);
            return "Valoración eliminada correctamente";
        }
    }
};

module.exports = resolvers;