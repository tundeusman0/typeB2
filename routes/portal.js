const express = require('express')
const router = express.Router()
const {User} = require ( '../models/user')
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs')
let auth = require('../config/auth')
let isAdmin = auth.isAdmin
const _ = require('lodash')

const passport = require('passport')


router.get('/', (req, res) => {
    res.render("admin/portal_dashboard")
})


router.get('/login-staff', (req, res) => {
    res.render('admin/staff_login')
})
router.post('/login-staff', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/portal/login-staff',
        failureFlash: true
    })(req, res, next)

})
router.get('/login-student', (req, res) => {
    res.render('admin/student_login')
})
router.post('/login-student', (req, res, next) => {
    let id = req.sessionID
    
        passport.authenticate('local', {
            successRedirect: `/portal/${id}`,
            failureRedirect: '/portal/login-student',
            failureFlash: true
        })(req, res, next)

})

router.get('/:id',(req,res)=>{
    if(req.user === undefined){
        req.params.id = "uygyrrrui"
    }else{
        req.params.id = req.user.id
    }
    User.findOne({ _id: req.params.id }).then((user) => {
        if (!user) { //if page not exist in db
            return res.status(404).send('Page not found');
        }
        let { email, faculty, department, designation, number } = user
        res.render('student/dashboard', {
            email, faculty, department, designation, number
        })
    }, (err) => {
        return res.status(404).send('Page not found');
    }).catch((err) =>{ 
     res.status(404).send('Page not found')

        })
})


// portal / logout

// router.get('/logout', (req, res) => {
//     req.logout()
//     req.flash('success', 'You are logged out!');
//     res.redirect('/portal/login');
// })





router.get('/update', (req, res) => {
    User.findOne({}).then((user) => {
        let email = user.email
        let username = user.username
        res.render("admin/admin", { email,username })
    }).catch((e)=>console.log(e))

    
})
router.post('/update', (req, res) => {
    let cpassword = req.body.cpassword
    let password = req.body.password
    let username = req.body.username
    let email = req.body.email
    if (cpassword === password) {
        User.findOne({}).then((user) => {
            let id = user._id
            console.log(password)
            console.log(user.password)
            bcrypt.compare(password, user.password, (err, ress) => {
                console.log(ress)
                if (ress) {
                    req.flash('error', 'Admin password already exist')
                    res.render('admin/admin', {
                        email, username
                    })
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            password = hash;
                    User.findByIdAndUpdate(id, { $set: { email, password, username } }, { new: true }).then((admin) => {

                        req.flash('success', 'Admin edited');
                        res.render("admin/admin_dashboard");

                    }).catch((e) => {
                        console.log(e)
                    })
                        })
                    })
                    
                }
            })

        }).catch((e)=>console.log(e))

    } else {
        req.flash('error', 'please make sure your password matches');
        console.log("please make sure your password matches")
        res.render('admin/admin', {
            email,
            username
        })
    }
})



module.exports = router
