const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');
const { sendBattleInvites, sendBattleStartMessage } = require('./communications');

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
        const battleId = Math.random().toString(36).substr(2, 5).toUpperCase();
        const { name, roundCount, audienceLimit } = req.body;
        const data = {
            _id: battleId,
            name,
            roundCount,
            audienceLimit,
        }

        Battle.create(data)
        .then(async battle => {
            const { players } = req.body;
            players.forEach(player => {
                battle.players.push({
                    email: player.email,
                    name: player.name,
                    accessCode: Math.random().toString(36).substr(2, 6).toUpperCase()
                })
            })
            
            const rounds = Array(battle.roundCount).fill().map((_, idx) => idx + 1);
            const votes = battle.players.reduce((votesList, player) => {
                const playerVotes = rounds.map(round => ({
                    round: round,
                    player: player._id,
                    viewers: []
                }))

                return votesList.concat(playerVotes)
            }, [])

            votes.forEach(vote => {
                battle.votes.push(vote)
            })

            battle.save();

            await sendBattleInvites(battle);
            return res.status(201).send({
                error: false,
                battle
            })
        })
    })

    app.get(`/api/battles/:battleId`, async (req, res) => {
        const { battleId } = req.params;

        const battleQuery = await Battle.aggregate().match({_id: battleId}).project({
            _id: 1,
            name: 1,
            startedOn: 1,
            endedOn: 1,
            players: 1,
            roundCount: 1,
            audienceLimit: 1,
            subscribers: 1,
            blacklist: 1,
            viewers: 1,
            comments: 1,
            currentRound: 1,
            currentTurn: 1,
            previousTurn: 1,
            createdOn: 1,
            votes: {
                _id: 0,
                round: 1,
                player: 1,
                voteCount: {
                    $size: '$viewers'
                }
            }
        })
        
        if ( battleQuery.length > 1 ) {
            const battle = battleQuery[0];
            return res.status(200).send(battle)
        } else {
            return res.status(404).send("Not Found")
        }  
    })

    // Start Battle
    app.post(`/api/battles/:battleId/start`, async (req, res) => {
        const { battleId } = req.params;

        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const currentTurn = battle.players[0]._id;
            const updatedBattle = await Battle.findByIdAndUpdate({ _id: battleId }, {
                startedOn: Date.now(),
                currentTurn: currentTurn
            });

            // Send pusher notification
            await pusher.startBattle(battleId, currentTurn);

            // Send sms notification
            await sendBattleStartMessage(updatedBattle);

            return res.status(201).send("OK")
        } else {
            return res.status(404).send("Not Found")
        }
    })

    // Next Turn
    app.post(`/api/battles/:battleId/next`, async (req, res) => {
        const { battleId } = req.params;

        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const { players, currentRound, currentTurn, previousTurn } = battle;
            const votes = await Battle.aggregate().match({_id: battleId}).project({
                votes: {
                    _id: 0,
                    round: 1,
                    player: 1,
                    voteCount: {
                        $size: '$viewers'
                    }
                }
            })

            if ( !previousTurn || currentTurn === previousTurn ) {
                const data = {
                    currentRound: currentRound,
                    currentTurn: players.filter(p => p._id !== currentTurn)[0]._id,
                    previousTurn: currentTurn,
                    votes: votes
                }

                await Battle.findByIdAndUpdate({ _id: battleId }, data)
                await pusher.nextTurn(battleId, data);
                return res.status(201).send(data)
            } else {
                const data = {
                    currentRound: currentRound + 1,
                    currentTurn: currentTurn,
                    previousTurn: currentTurn,
                    votes: votes
                }
                
                await Battle.findByIdAndUpdate({ _id: battleId }, data);
                await pusher.nextTurn(battleId, data);
                return res.status(201).send(data)
            }
        } else {
            return res.status(404).send("Not Found")
        }
    })

    // End Battle
    app.post(`/api/battles/:battleId/end`, async (req, res) => {
        const { battleId } = req.params;
        const votes = await Battle.aggregate().match({_id: battleId}).project({
            votes: {
                _id: 0,
                round: 1,
                player: 1,
                voteCount: {
                    $size: '$viewers'
                }
            }
        })

        await Battle.findByIdAndUpdate({ _id: battleId }, {
            endedOn: Date.now(),
            currentTurn: null
        })
        await pusher.endBattle(battleId, votes)
        return res.status(201).send(votes)
    })

    // Post vote
    app.post(`/api/battles/:battleId/votes`, async (req, res) => {
        const { battleId } = req.params;
        const { userId, round, playerId } = req.body;

        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const players = battle.players;

            const updatePromises = players.map(player => {
                if ( player._id === playerId ) {
                    return Battle.updateOne(
                        { "_id": battleId, "votes.round": round, "votes.player": playerId },
                        { "$addToSet": {"votes.$.viewers": userId }}
                    );
                } else {
                    return Battle.updateOne(
                        { "_id": battleId, "votes.round": round, "votes.player": playerId },
                        { "$pull": {"votes.$.viewers": userId }}
                    );
                }
            })

            Promise.all(updatePromises)
            .then(() => res.status(201).send("OK"))
        } else {
            return res.status(404).send("Not Found")
        }
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