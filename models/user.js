const mongoose = require("mongoose")
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    // username:{
    //     type: String,
    //     required: true,
    //     unique: true,
    //     default: "admin"
    // },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: `{VALUE} is not a valid email`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        default:"password"
    },
    fact: {
        type: String
    },
    admin:{
        type:Number
    },
    appointment:{
        type:String
    },
    designation:{
        type:String,
    },
    faculty: {
        type: String,
    },
    department: {
        type: String,
    },
    number: {
        type: String,
        unique: true,
        required: true
    }
    
    // tokens: [{
    //     access: {
    //         type: String,
    //         required: true
    //     },
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]

   
})
UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        return !user ? Promise.reject() :
            new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    return res ? resolve(user) : reject()
                })
            })
    })

}

let User = mongoose.model('User', UserSchema);

module.exports = { User }
