var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim: true,
        minlength: 3,
    },
    slug:{
        type:String
    },
    subs:[{
        title:{
            type:String
        },
        content:{
            type:String
        }
    }],
    sub:{
        type:String
    },
    content:{
        type:String,
        minlength: 5
    },
    sorting:{
        type:Number,
        required:true
    }
});

let Page = mongoose.model('Page', pageSchema);
// console.log(Page)

// let newPage = new Page({
//     title: "oyah gupaaaaaaa"
// })
// newPage.save(function(err,doc){
//     // console.log(doc)
// })
// newPage.save().then((doc)=>{
//     console.log(doc,'successful')
// },(e)=>{
//     console.log(e,'unable to save db')
// })
// Page.findOne({ title }, (err, page) => { console.log(page) })

// Page.find({},(err,doc)=>{
//     console.log(doc)
// })

module.exports = {Page}