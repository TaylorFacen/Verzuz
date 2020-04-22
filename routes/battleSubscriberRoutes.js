const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/subscribers`, async (req, res) => {
        const { battleId } = req.params;

        let battle = await Battle.findById(battleId);
        if ( battle ) {
            return res.status(200).send(battle.subscribers)
        } else {
            return res.status(404).send("Not Found")
        }
    })
}