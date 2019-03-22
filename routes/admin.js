const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const { Faculty } = require('../models/faculty')
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs')
let auth = require('./../config/auth')
const isAdmin = auth.isAdmin
const _ = require('lodash')

const passport = require('passport')


router.get('/',isAdmin, (req, res) => {
    res.render("admin/admin_dashboard")
})


router.get('/register-staff', (req, res) => {
    Faculty.find({}).then(faculties=>{
        res.render("admin/admin_register-staff",{
            faculties
        })
    })
})

router.post('/register-staff', [
    // check('password').isLength({ min: 6 }).trim().withMessage('password empty. Must be atleast 5 characters'),
    check('email').isLength({ min: 5 }).trim().withMessage('email empty. Must be atleast 5 characters'),
    check('appointment').isLength({ min: 5 }).trim().withMessage('appointment empty. Must be atleast 5 characters'),
    check('designation').isLength({ min: 5 }).trim().withMessage('designation empty. Must be atleast 5 characters'),
    check('faculty').isLength({ min: 5 }).trim().withMessage('faculty empty. Must be atleast 5 characters'),
    check('department').isLength({ min: 5 }).trim().withMessage('department empty. Must be atleast 5 characters'),
    check('number').isLength({ min: 5 }).trim().withMessage('number empty. Must be atleast 5 characters'),
], (req, res) => {
    let {email,appointment,designation,faculty,department,number} = req.body
    let password = "staffpassword"
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        User.findOne({ number }).then(user => {
            if (!user) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                password = hash;
                let user = new User({ email, password, appointment, designation, faculty, department, number })
                user.save().then((user) => {
                    // console.log(user)
                    req.flash('success', 'Staff added');
                    // res.render("admin/admin_dashboard");
                    res.redirect("/admin");

                }).catch((e) => {
                    req.flash('error', "duplicate email or id")
                    console.log(e)
                    res.render('admin/admin_register-staff', {
                        errors: errors.array(), email, faculty, department, number
                    })
                })
            })
        })
            } else {
                console.log(user.number)
                req.flash('error', 'id already exits');
                console.log("id:id already exits")
                Faculty.find({}).then(faculties => {
                    res.render("admin/admin_register-staff", {
                        errors: errors.array(), faculties, email,
                        // faculty, department, 
                        number
                    })
                })
            }
        })
    } else {
        req.flash('error', 'please make sure you fill the required fields');
        console.log("please make sure you fill the required fields")
        res.render('admin/admin_register-staff', {
            errors: errors.array(), password, email, appointment, designation, faculty, department, number
        })
    }
})
router.get('/register-student',isAdmin, (req, res) => {
    Faculty.find({}).then(faculties => {
        res.render("admin/admin_register-student", {
            faculties
        })
    })
    // res.render("admin/admin_register-student")
})

// router.post('/re-select', (req, res) => {
//     // console.log(req.body)
//     let retriever = Object.keys(req.body)
//     console.log(retriever.join())
//     console.log(res.redirect())
//     return res.redirect('/')

// })

router.post('/register-student', [
    // check('password').isLength({ min: 6 }).trim().withMessage('password empty. Must be atleast 6 characters'),
    check('email').isLength({ min: 5 }).trim().withMessage('email empty. Must be atleast 5 characters'),
    check('faculty').isLength({ min: 6 }).trim().withMessage('faculty empty. Must be atleast 5 characters'),
    check('department').isLength({ min: 6 }).trim().withMessage('department empty. Must be atleast 5 characters'),
    check('number').isLength({ min: 6 }).trim().withMessage('number empty. Must be atleast 5 characters'),
], (req, res) => {
    let { email, faculty, department, number } = req.body
    const errors = validationResult(req);
    let password = "password";
    if (errors.isEmpty()) {
        User.findOne({number}).then(user=>{
            if(!user){
                // console.log(user.number)
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        password = hash;
                        let user = new User({ email, faculty, department, number, password, designation: "student" })
                        user.save().then((user) => {
                            // console.log(user)
                            req.flash('success', 'student added');
                            // res.render("admin/admin_dashboard");
                            res.redirect("/admin");


                        }).catch((e) => {
                            req.flash('error', "duplicates email ")
                            console.log(e,"duplicates")
                            Faculty.find({}).then(faculties=>{
                                res.render("admin/admin_register-student", {
                                    errors: errors.array(),faculties, email, 
                                    // faculty, department, 
                                    number
                                })
                            })
                            
                        })
                    })
                })
            }else{
                console.log(user.number)
                req.flash('error', 'id already exits');
                console.log("id:id already exits")
                Faculty.find({}).then(faculties => {
                    res.render("admin/admin_register-student", {
                        errors: errors.array(), faculties, email,
                        // faculty, department, 
                        number
                    })
                })
            }
        })
        // bcrypt.genSalt(10, (err, salt) => {
        //     bcrypt.hash(password, salt, (err, hash) => {
        //         password = hash;
        //         let user = new User({ email, faculty, department, number, password, designation:"student"})
        //         user.save().then((user) => {
        //             // console.log(user)
        //             req.flash('success', 'student added');
        //             // res.render("admin/admin_dashboard");
        //             res.redirect("/admin");


        //         }).catch((e) => {
        //             req.flash('error', "duplicate email or id")
        //             console.log(e)
        //             res.render('admin/admin_register-student', {
        //                 errors: errors.array(), email, faculty, department, number
        //             })
        //         })
        //     })
        // })
    } else {
        req.flash('error', 'please make sure you fill the required fields');
        console.log("please make sure you fill the required fields")
        Faculty.find({}).then(faculties => {
            res.render("admin/admin_register-student", {
                errors: errors.array(), faculties, email,
                // faculty, department, 
                number
            })
        })
        // res.render('admin/admin_register-student',{
        //     errors: errors.array(), password, email, faculty, department, number
        // })
    }
})


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

router.get('/login',(req,res)=>{
    // if (res.locals.user) res.redirect('/');
    res.render('admin/admin_login')
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/admin',
        failureRedirect:'/admin/login',
        failureFlash:true
    })(req,res,next)
    
})
// router.get('/login-staff', (req, res) => {
//     // if (res.locals.user) res.redirect('/');
//     res.render('admin/staff_login')
// })
// router.post('/login-staff', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/admin/login-staff',
//         failureFlash: true
//     })(req, res, next)

// })
// router.get('/login-student', (req, res) => {
//     // if (res.locals.user) res.redirect('/');
//     res.render('admin/student_login')
// })
// router.post('/login-student', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/admin/login-student',
//         failureFlash: true
//     })(req, res, next)

// })




router.get('/logout', (req, res) => {
    // req.session.destroy()
    req.logout()
    // console.log(res.clearCookie())
    res.clearCookie().redirect('/portal');
    req.flash('success', 'You are logged out!');
    // res.redirect('/portal');
    // res.redirect('/admin/login');
})


module.exports = router
