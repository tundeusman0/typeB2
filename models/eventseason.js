var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventseasonSchema = new Schema({
    eventseason: {
        type: String,
        default: "2019/2020",
        minlength: 9
    }
})
let Eventseason = mongoose.model('Eventseason', eventseasonSchema);
module.exports = { Eventseason }

