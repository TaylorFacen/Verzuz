const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    name: String,
    createdOn: { type: Date, required: true, default: Date.now }
})

mongoose.model('rooms', roomSchema);