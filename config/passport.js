const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('./../db/mongoose')
let User = require('../models/user')
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(
        new LocalStrategy(
            {usernameField:'email'},
        (email,password,done)=>{
            User.User.findOne({ email}).then(user=>{
                if(!user){
                    return done(null,false,{message:'this email is not registerd'})
                }
                
                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    // console.log(isMatch)
                    if(err) throw err;
                    if(isMatch){
                        // console.log(isMatch)
                        return done(null,user);
                    }else{
                        return done(null,false,{message:'password incorrect'})
                    }
                })
            }).catch((e)=>console.log(e))
        })
    );

    passport.serializeUser( (user, done)=> {
        done(null, user.id);
    });

    // passport.deserializeUser(function (user, done) {
    //     done(null, user);
    // });
    passport.deserializeUser(function (id, done){
        User.User.findById(id,  function (err, user) {
            done(err, user);
            // console.log(user)
        });
    });

}

