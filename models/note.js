var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    title: String,
    body: String
});

var Note = mongoose.model('Note', NoteSchema);

//Export Model
module.exports = Note: