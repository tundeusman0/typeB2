const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Page = require('./../models/pages')

let title = '',slug= '',content='';
router.get('/', (req, res) => {
    // res.render('home.hbs', {
    //     title: 'TYPE B SCHOOL APP'
    // })
    res.send('admin pages')
})

router.get('/pages/add-pages', (req, res) => {
    res.render('partials/admin/add_pages.hbs', {
        title,slug,content
    })
})

router.post('/pages/add-pages', (req, res) => {
    

})


module.exports = router
