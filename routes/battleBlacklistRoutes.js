const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

module.exports = ( app ) => {
    app.post(`/api/battles/:battleId/blacklist`, async (req, res) => {
        const { battleId } = req.params;
        const { phoneNumber } = req.body;

        if ( phoneNumber ) {
            let battle = await Battle.findByIdAndUpdate(battleId, { $addToSet: { blacklist: phoneNumber } })

            if ( battle ) {
                return res.status(201).send("OK")
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber required")
        }
    })
}