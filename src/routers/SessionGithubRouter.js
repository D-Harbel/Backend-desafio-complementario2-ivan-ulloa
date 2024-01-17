const express = require('express');
const router = express.Router();
const passport = require('passport')

module.exports = function (io) {
    router.get('/github', passport.authenticate('github', {}), (req, res) => { })

    router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/github/errorGithub" }), (req, res) => {
        req.session.isAuthenticated = true;
        console.log(req.user)
        req.session.usuario = req.user
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/views/products')

    });

    router.get('/errorGithub', (req, res) => {

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            error: "Error al autenticar con Github"
        });
    });

    return router;
}