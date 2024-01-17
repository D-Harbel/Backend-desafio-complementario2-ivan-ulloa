const passport = require('passport')
const github = require('passport-github2')
const usermodel = require('../dao/models/usermodel')

const initPassportGithub=()=>{
    const callbackURL = process.env.NODE_ENV === 'production'
        ? 'https://url-modificable/api/github/callbackGithub'
        : 'http://localhost:3000/api/github/callbackGithub';

    passport.use('github', new github.Strategy(
        {
            clientID: "Iv1.4eb7afd2f382b1a5", 
            clientSecret: "eb68b650b3e626944314bed011971c1c46d3fe12", 
            callbackURL,
        },
        async(accessToken, refreshToken, profile, done)=>{
            try {
                let usuario=await usermodel.findOne({email: profile._json.email})
                if(!usuario){
                    let nuevoUsuario={
                        nombre: profile._json.name,
                        email: profile._json.email, 
                        profile
                    }

                    usuario=await usermodel.create(nuevoUsuario)
                }
                return done(null, usuario)


            } catch (error) {
                return done(error)
            }
        }
    ))


    passport.serializeUser((usuario, done)=>{
        return done(null, usuario._id)
    })

    passport.deserializeUser(async(id, done)=>{
        let usuario=await usermodel.findById(id)
        return done(null, usuario)
    })
}

module.exports = initPassportGithub
