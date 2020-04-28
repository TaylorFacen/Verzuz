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
        const { userId, name, text } = req.body;

        if ( userId && name && text ) {
            const battle = await Battle.findById(battleId);

            if ( battle ) {
                const comment = {
                    userId: userId,
                    name,
                    text,
                    createdOn: Date.now(),
                    _id: Math.random().toString(36).substr(2, 10).toUpperCase()
                }

                const updatedBattle = await Battle.findByIdAndUpdate(battleId, { $push: { comments: comment } })
                await pusher.addComment(battleId, comment)
                return res.status(201).send("OK")
                
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("userId (phoneNumber or email), name, and text required")
        }
    })
}