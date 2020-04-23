const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const viewers = battle.viewers;
            return res.status(201).send({viewers: viewers})
        } else {
            return res.status(404).send("Not Found")
        }
    })
    app.post(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { phoneNumber, name, userType } = req.body;
        const viewer = {
            phoneNumber,
            name,
            userType
        }

        if ( phoneNumber && name && userType ) {
            await Battle.findByIdAndUpdate(battleId, { $pull: { viewers: {phoneNumber: phoneNumber} } })
            const battle = await Battle.findByIdAndUpdate(battleId, { $push: { viewers: viewer } })

            if ( battle ) {
                return res.status(201).send("OK")
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber, name, and userType required")
        }
    })
}