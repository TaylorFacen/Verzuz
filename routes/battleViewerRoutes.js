const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

// Helper Functions //

const addUserVotes = async ( battle, viewer) => {
    const rounds = Array.from(new Set(battle.votes.map(v => v.round)));
    const votes = rounds.map(round => {
        const userVote = battle.votes.find(v => v.round === round && v.viewers.includes(viewer._id));
        if ( userVote ) {
            return { round: round, playerId: userVote.player}
        } else {
            return { round: round, playerId: null }
        }
    })

    return {
        ...viewer,
        votes
    }
}

// Routes //

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const userId = req.query;

        if ( userId ) {
            const battle = await Battle.findById(battleId);
            
            if ( battle ) {
                const viewers = battle.viewers;
                const viewer = viewers.find(v => v._id === userId);
                return res.status(201).send(viewer) 
            } else {
                return res.status(404).send("Battle not Found")
            }
        } else {
            res.status(400).send("userId required")
        }
    })
    
    app.post(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { phoneNumber, name, userType } = req.body;

        if ( phoneNumber && name && userType ) {
            const battle = await Battle.findById(battleId);

            if ( battle ) {
                const viewer = battle.viewers.find(viewer => viewer.phoneNumber === phoneNumber);

                if ( viewer ) {
                    if ( !!viewer.lefton ) {
                        // Viewer once left in the past
                        await Battle.updateOne(
                            { "_id": battleId, "viewers.phoneNumber": phoneNumber },
                            { "$set": {"viewers.$.name": name, "viewers.$.leftOn": null}}
                        );

                        await pusher.addViewer(battleId, viewer);
                    } else {
                        await Battle.updateOne(
                            { "_id": battleId, "viewers.phoneNumber": phoneNumber },
                            { "$set": {"viewers.$.name": name}}
                        );
                
                        // Will add back in the future
                        // await pusher.bootViewer(battleId, phoneNumber, 'new session');
                    }

                    // Add viewer votes
                    const updatedViewer = addUserVotes(battle, viewer);
                    

                    return res.status(201).send(updatedViewer) 

                } else {
                    const newViewer = {
                        phoneNumber,
                        name,
                        userType,
                        joinedOn: Date.now(),
                        leftOn: null
                    }
                    // Add viewer to battle
                    Battle.findByIdAndUpdate(battleId, { $push: { viewers: newViewer } })
                    .then(async battle => {
                        const viewer = battle.viewers.find(viewer => viewer.phoneNumber === phoneNumber);

                        // Trigger pusher event
                        await pusher.addViewer(battleId, viewer)

                        // Add viewer votes
                        const updatedViewer = addUserVotes(battle, viewer);

                        return res.status(201).send(updatedViewer)
                    })
                }
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber, name, and userType required")
        }
    })

    app.delete(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { userId, reason } = req.query;

        if ( phoneNumber && reason ) {
            const battle = await Battle.findById(battleId);
            
            if ( battle ) {
                const updatedBattle = await Battle.updateOne(
                    { "_id": battleId, "viewers._id": userId },
                    { "$set": {"viewers.$.leftOn": Date.now()}}
                );
                await pusher.bootViewer(battleId, userId, reason)
                return res.status(201).send("OK");
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("userId and reason required")
        }
    })
}