let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let carouselSchema = new Schema({
    title:{
        type:String,
        required:true,
        minlength: 3
    },
    desc:{
        type:String,
        minlength: 6
    },
    image:{
        type:String,
        required:true
    },
    slug: {
        type: String
    },
    sorting: {
        type: Number,
        required: true
    }
})

let Carousel = mongoose.model('Carousel', carouselSchema);

module.exports = {Carousel}
