var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var infoSchema = new Schema({
    schTitle: {
        type: String,
        default:"TypeB App"
    }
})
let Info = mongoose.model('Info', infoSchema);
module.exports = { Info }

