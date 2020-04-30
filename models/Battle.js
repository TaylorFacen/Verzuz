const mongoose = require('mongoose');
const { Schema } = mongoose;

const voteSchema = new Schema({
    round: Number,
    player: String
})

const viewerSchema = new Schema({
    phoneNumber: String,
    name: String,
    userType: String,
    joinedOn: Date,
    leftOn: Date,
    votes: [voteSchema]
})

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
    viewers: [viewerSchema],
    comments: Array,
    currentRound: Number,
    currentTurn: String,
    previousTurn: String,
    createdOn: { type: Date, required: true, default: Date.now }
})

mongoose.model('battles', battleSchema);