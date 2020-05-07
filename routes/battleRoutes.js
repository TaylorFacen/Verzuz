const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper Functions

const getScores = async (battleId, currentRound) => {
    const scores = await Battle.aggregate([
        {$match: {_id: battleId}},
        {$project: {
            _id: 0,
            votes: {
                $reduce: {
                    input: "$viewers.votes",
                    initialValue: [],
                    in: { $concatArrays : ["$$value", "$$this"] }
                }
            }
        }},
        {$unwind: "$votes"},
        {$group: {
            _id: {
                round: "$votes.round",
                player: "$votes.player"
            },
            count: {$sum: 1}
        }}
    ])

    return scores.map(score => ({
        round: score._id.round,
        player: score._id.player,
        votes: score.count
    })).filter(score => score.round < currentRound )
}

const sendBattleInvites = async battle => {
    const participants = battle.participants;
    participants.forEach(participant => {
        const data = {
            "name": participant.name,
            "battleName": battle.name,
            "roundCount": battle.roundCount,
            "opponentName": participants.find(p => p.email !== participant.email).name,
            "audienceLimit": battle.audienceLimit,
            "viewerLink": `https://www.verzuz.app/battles/${battle._id}/join`,
            "playerLink": `https://www.verzuz.app/battles/${battle._id}/host`,
            "accessCode": participant.accessCode
        }

        const msg = {
            to: participant.email,
            from: 'hello@verzuz.app',
            templateId: 'd-89100ea50b9843789efe286cee700a80',
            dynamic_template_data: data,
            customArgs: {
                env: process.env.ENV
            }
        };

        sgMail.send(msg);
    })
    
}

// Routes

module.exports = ( app ) => {
    app.get(`/api/battles`, async (req, res) => {
        let battles = await Battle.find({}, {
            "_id": 1,
            "name": 1,
            "createdOn": 1,
            "startedOn": 1,
            "endedOn": 1
        });
        return res.status(200).send(battles);
    });

    app.post(`/api/battles`, async (req, res) => {
        const data = {
            _id: Math.random().toString(36).substr(2, 5).toUpperCase(),
            currentRound: 1,
            ...req.body
        }

        Battle.create(data)
        .then(async battle => {
            await sendBattleInvites(battle);
            return res.status(201).send({
                error: false,
                battle
            })
        })
    })

    // Start Battle
    app.post(`/api/battles/:battleId/start`, async (req, res) => {
        const { battleId } = req.params;
        const { currentTurn } = req.body;

        if ( currentTurn ) {
            const updatedBattle = await Battle.findByIdAndUpdate({ _id: battleId }, {
                startedOn: Date.now(),
                currentTurn: currentTurn
            })

            await pusher.startBattle(battleId, currentTurn)
            return res.status(201).send("OK")
        } else {
            return res.status(400).send("currentTurn required")
        }

        
    })

    // Next Turn
    app.post(`/api/battles/:battleId/next`, async (req, res) => {
        const { battleId } = req.params;

        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const participants = battle.participants;
            const currentRound = battle.currentRound;
            const currentTurn = battle.currentTurn;
            const previousTurn = battle.previousTurn;

            if ( !previousTurn || currentTurn === previousTurn ) {
                const scores = await getScores(battleId, currentRound);
                const data = {
                    currentRound: currentRound,
                    currentTurn: participants.filter(p => p.email !== currentTurn)[0].email,
                    previousTurn: currentTurn,
                    scores: scores
                }

                const updatedBattle = await Battle.findByIdAndUpdate({ _id: battleId }, data)
                await pusher.nextTurn(battleId, data);
                return res.status(201).send("OK")
            } else {
                const scores = await getScores(battleId, currentRound + 1);
                const data = {
                    currentRound: currentRound + 1,
                    currentTurn: currentTurn,
                    previousTurn: currentTurn,
                    scores: scores
                }
                
                const updatedBattle = await Battle.findByIdAndUpdate({ _id: battleId }, data);
                await pusher.nextTurn(battleId, data);
                return res.status(201).send("OK")
            }
        } else {
            return res.status(404).send("Not Found")
        }
    })

    // End Battle
    app.post(`/api/battles/:battleId/end`, async (req, res) => {
        const { battleId } = req.params;

        const updatedBattle = await Battle.findByIdAndUpdate({ _id: battleId }, {
            endedOn: Date.now()
        })
        await pusher.endBattle(battleId)
        return res.status(201).send("OK")
    })

    app.get(`/api/battles/:battleId`, async (req, res) => {
        const { battleId } = req.params;

        let battleQuery = await Battle.aggregate().match({_id: battleId}).project({
            name: 1,
            startedOn: 1,
            endedOn: 1,
            participants: 1,
            createdOn: 1,
            roundCount: 1,
            currentRound: 1,
            currentTurn: 1,
            previousTurn: 1,
            audienceLimit: 1,
            blacklist: 1,
            viewers: {
                $size: {
                    "$filter": {
                        "input": "$viewers",
                        "as": "item",
                        "cond": { "$eq": [ "$$item.leftOn", null ] }
                    }
                }
            }
        })
        
        if ( battleQuery.length > 0 ) {
            const battle = battleQuery[0];
            const scores = await getScores(battleId, battle.currentRound);

            const battleWithScores = {
                ...battle,
                scores
            }

            return res.status(200).send(battleWithScores)
        } else {
            return res.status(404).send("Not Found")
        }  
    })

    // Post vote
    app.post(`/api/battles/:battleId/votes`, async (req, res) => {
        const { battleId } = req.params;
        const { phoneNumber, currentRound, player } = req.body;

        const battle = await Battle.findOne({"_id": battleId}, (err, battle) => {
            const viewer = battle.viewers.find(v => v.phoneNumber === phoneNumber);
            const roundVote = viewer.votes.find(v => v.round === currentRound);
            roundVote.player = player
            battle.save();
            return res.status(201).send("OK")
        })
    })

    app.put(`/api/battles/:battleId`, async (req, res) => {
        const { battleId } = req.params;

        let battle = await Battle.findByIdAndUpdate(battleId, req.body);

        return res.status(202).send({
            error: false,
            battle
        })
    })

    app.delete(`/api/battles/:battleId`, async (req, res) => {
        const { battleId } = req.params;

        await Battle.findByIdAndDelete(battleId);

        return res.status(202).send({
            error: false
        })
    })
}