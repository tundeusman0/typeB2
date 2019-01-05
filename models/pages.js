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
    content:{
        type:String,
        minlength: 5
    },
    sorting:{
        type:Number,
        // required:true
    }
});

let Page = mongoose.model('Page', pageSchema);
// console.log(Page)

// let newPage = new Page({
//     title: "oyah gupaaaaaaa"
// })
// newPage.save().then((doc)=>{
//     console.log(doc,'successful')
// },(e)=>{
//     console.log(e,'unable to save db')
// })

module.exports = Page