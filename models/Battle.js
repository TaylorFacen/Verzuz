const mongoose = require('mongoose');
const { Schema } = mongoose;

const battleSchema = new Schema({
    _id: String,
    name: String,
    createdOn: { type: Date, required: true, default: Date.now }
})

mongoose.model('battles', battleSchema);