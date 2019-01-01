var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim: true,
        minlength: 10,
    },
    slug:{
        type:String
    },
    content:{
        type:String
    },
    sorting:{
        type:Number,
        required:true
    }
});

let Page = mongoose.model('Page', pageSchema);

module.exports.Page = Page