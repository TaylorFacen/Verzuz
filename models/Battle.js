const mongoose = require('mongoose');
const { Schema } = mongoose;

const viewerSchema = new Schema({
    phoneNumber: String,
    name: String,
    userType: String,
    joinedOn: Date,
    leftOn: Date
})

const playerSchema = new Schema({
    email: String,
    name: String,
    accessCode: String
})

const votesSchema = new Schema({
    round: Number,
    player: {type: Schema.Types.ObjectId, ref: 'playerSchema'},
    viewers: [{type: Schema.Types.ObjectId, ref: 'viewerSchema'}]
})

const battleSchema = new Schema({
    _id: String,
    name: String,
    startedOn: Date,
    endedOn: Date,
    players: [playerSchema],
    roundCount: Number,
    audienceLimit: Number,
    subscribers: Array,
    blacklist: Array,
    viewers: [viewerSchema],
    comments: Array,
    currentRound: Number,
    currentTurn: {type: Schema.Types.ObjectId, ref: 'playerSchema'},
    previousTurn: {type: Schema.Types.ObjectId, ref: 'playerSchema'},
    createdOn: { type: Date, required: true, default: Date.now },
    votes: [votesSchema]
})

mongoose.model('battles', battleSchema);