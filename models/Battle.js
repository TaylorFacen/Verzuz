const mongoose = require('mongoose');
const { Schema } = mongoose;

const battleSchema = new Schema({
    _id: String,
    name: String,
    startedOn: Date,
    endedOn: Date,
    createdOn: { type: Date, required: true, default: Date.now }
})

mongoose.model('battles', battleSchema);