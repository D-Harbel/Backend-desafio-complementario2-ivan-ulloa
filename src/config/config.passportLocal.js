const passport = require('passport')
const local = require('passport-local')
const usuariosModelo = require('../dao/models/usermodel')
const { creaHash, validaPassword } = require('../utils')

const inicializarPassport = () => {

    passport.use('registrate', new local.Strategy(
        {
            passReqToCallback: true, usernameField: 'email'
        },
        async (req, username, password, done) => {
            try {
                console.log("estrategia local, registro Passport!")
                let { first_name, last_name, email, age } = req.body
                if (!first_name || !last_name || !age || !email || !password) {
                    return done(null, false)
                }

                if (email === 'adminCoder@coder.com') {
                    return done(null, false, { message: 'Cannot register with admin email' })
                }

                let regMail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
                console.log(regMail.test(email))
                if (!regMail.test(email)) {
                    return done(null, false)
                }

                let existe = await usuariosModelo.findOne({ email })
                if (existe) {
                    return done(null, false)
                }

                password = creaHash(password)
                console.log(password)
                let usuario
                try { 
                    usuario = await usuariosModelo.create({ first_name, last_name, email, password, age })
                    return done(null, usuario)

                } catch (error) {
                    return done(null, false)
                }
            } catch (error) {
                return done(error)
            }


        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email'
        },
        async (username, password, done) => {
            try {
                if (!username || !password) {
                    return done(null, false);
                }

                let usuario;

                if (username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                    usuario = {
                        first_name: 'Admin',
                        last_name: 'Coder',
                        email: 'adminCoder@coder.com',
                        admin: true,
                    };
                } else {
                    usuario = await usuariosModelo.findOne({ email: username }).lean();
                    if (!usuario) {
                        console.log('Usuario no encontrado en la base de datos');
                        return done(null, false);
                    }

                    if (!validaPassword(usuario, password)) {
                        return done(null, false);
                    }
                }

                console.log('Usuario autenticado:', usuario);
                console.log(Object.keys(usuario));
                delete usuario.password;
                return done(null, usuario);
            } catch (error) {
                done(error, null);
            }
        }
    ));

    passport.serializeUser((usuario, done) => {
        if (usuario.admin) {
            return done(null, 'admin');
        } else {
            return done(null, usuario._id);
        }
    });

    passport.deserializeUser(async (id, done) => {
        if (id === 'admin') {
            return done(null, {
                first_name: 'Admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                admin: true
            });
        } else {
            try {
                let usuario = await usuariosModelo.findById(id);
                if (!usuario) {
                    return done(new Error('Usuario no encontrado'), null);
                }
                return done(null, usuario);
            } catch (error) {
                done(error, null);
            }
        }
    });
}

module.exports = inicializarPassport