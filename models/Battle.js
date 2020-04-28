const mongoose = require('mongoose');
const { Schema } = mongoose;

const battleSchema = new Schema({
    _id: String,
    name: String,
    startedOn: Date,
    endedOn: Date,
    participants: Array,
    roundCount: Number,
    audienceLimit: Number,
    subscribers: Array,
    blacklist: Array,
    viewers: Array,
    comments: Array,
    currentRound: Number,
    currentTurn: String,
    createdOn: { type: Date, required: true, default: Date.now }
})

mongoose.model('battles', battleSchema);