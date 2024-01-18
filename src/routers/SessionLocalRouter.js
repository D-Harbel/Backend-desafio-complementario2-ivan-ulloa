const express = require('express');
const router = express.Router();
const passport = require('passport')


module.exports = function (io) {

    router.get('/errorLogin', (req, res) => {
        return res.redirect('/login?error=Error en el proceso de login... :(')
    })

    router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/errorLogin' }), async (req, res) => {
        req.session.isAuthenticated = true;
        console.log(req.user)

        req.session.usuario = {
            cartID: req.user.cart.toString(),
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email,
            role: req.user.role || 'user',
        };

        res.redirect('/views/products')
    });


    router.get('/errorRegistrate', (req, res) => {
        return res.redirect('/registrate?error=Error en el proceso de registro')
    })

    router.post('/registrate', passport.authenticate('registrate', { failureRedirect: '/api/sessions/errorRegistrate' }), async (req, res) => {

        let { email } = req.body
        res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`)
    })

    router.get('/current', (req, res) => {
        if (req.session.isAuthenticated) {
            return res.status(200).json({
                user: req.session.usuario
            });
        } else {
            return res.status(401).json({
                error: 'No hay usuario autenticado'
            });
        }
    });

    router.get('/logout', (req, res) => {

        req.session.destroy(error => {
            if (error) {
                res.redirect('/login?error=fallo en el logout')
            }
        })

        res.redirect('/login')

    });

    return router;
}
