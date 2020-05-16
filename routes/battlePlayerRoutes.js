const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

// Routes //

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/players`, async (req, res) => {
        const { battleId } = req.params;
        const userId = req.query;

        if ( userId ) {
            const battle = await Battle.findById(battleId);
            
            if ( battle ) {
                const players = battle.players;
                const player = players.find(p => p._id === userId);
                return res.status(201).send(player) 
            } else {
                return res.status(404).send("Battle not Found")
            }
        } else {
            res.status(400).send("userId required")
        }
    })
}