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
            ...req.body
        }

        let battle = await Battle.create(data);
        return res.status(201).send({
            error: false,
            battle
        })
    })

    app.get(`/api/battles/:battleId`, async (req, res) => {
        const { battleId } = req.params;

        let battle = await Battle.findById(battleId);
        if ( battle ) {
            return res.status(200).send(battle)
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