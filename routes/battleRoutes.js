const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

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

        let battle = await Battle.create(data);
        return res.status(201).send({
            error: false,
            battle
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

        let battle = await Battle.aggregate().match({_id: battleId}).project({
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
        
        if ( battle.length > 0 ) {
            return res.status(200).send(battle[0])
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