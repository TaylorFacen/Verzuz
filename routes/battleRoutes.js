const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

const generateId = () => {
    return Math.random().toString(23).substring(2, 7).toUpperCase();
}

module.exports = ( app ) => {
    app.get(`/api/battles`, async (req, res) => {
        let battles = await Battle.find({}, {
            "_id": 1,
            "name": 1,
            "createdOn": 1
        });
        return res.status(200).send(battles);
    });

    app.post(`/api/battles`, async (req, res) => {
        const data = {
            _id: new mongoose.Types.ObjectId().toHexString().substring(0, 5).toUpperCase(),
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

        return res.status(200).send(battle)
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