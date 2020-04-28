const pusher = require('./pusher');
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/comments`, async (req, res) => {
        const { battleId } = req.params;
        const battle = await Battle.findById(battleId);

        if ( battle ) {
            return res.status(201).send({comments: battle.comments})
        } else {
            return res.status(404).send("Not Found")
        }
    })

    app.post(`/api/battles/:battleId/comments`, async (req, res) => {
        const { battleId } = req.params;
        const { email, phoneNumber, name, text } = req.body;

        if ( phoneNumber && name && text ) {
            const battle = await Battle.findById(battleId);

            if ( battle ) {
                const comment = {
                    userId: phoneNumber || email,
                    name,
                    text,
                    createdOn: Date.now(),
                    _id: Math.random().toString(36).substr(2, 10).toUpperCase()
                }

                await Battle.findByIdAndUpdate(battleId, { $push: { commnets: comment } })
                pusher.addComment(battleId, comment)
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber, name, and text required")
        }
    })
}