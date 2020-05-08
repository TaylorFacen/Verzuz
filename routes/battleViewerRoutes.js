const pusher = require('./pusher')
const mongoose = require('mongoose');
const Battle = mongoose.model('battles');

// Helper Functions //
const isViewerInBattle = async (battleId, phoneNumber) => {
    const battle = await Battle.findById(battleId);
    const viewers = battle.viewers;

    return viewers.filter(v => v.phoneNumber === phoneNumber).length > 0;
}

const addViewer = async (battleId, viewer) => {
    // Add viewer record
    const battle = await Battle.findByIdAndUpdate(battleId, { $push: { viewers: viewer } })

    // Trigger pusher event
    const resp = pusher.addViewer(battleId, viewer)

    return {
        battle,
        resp
    }
}

const handleExistingViewer = async (battleId, phoneNumber, name) => {
    // Get viewer record
    const battle = await Battle.findById(battleId);
    const viewers = battle.viewers;
    const viewer = viewers.filter(v => v.phoneNumber === phoneNumber)[0];

    if (!!viewer.leftOn) {
        // Viewer once left in the past
        const updatedBattle = await Battle.updateOne(
            { "_id": battleId, "viewers.phoneNumber": phoneNumber },
            { "$set": {"viewers.$.name": name, "viewers.$.leftOn": null}}
        );

        const resp = await pusher.addViewer(battleId, viewer);
        return {viewer}
    } else {
        const updatedBattle = await Battle.updateOne(
            { "_id": battleId, "viewers.phoneNumber": phoneNumber },
            { "$set": {"viewers.$.name": name}}
        );

        // Will add back in the future
        // const resp = await pusher.bootViewer(battleId, phoneNumber, 'new session');
        return viewer
    }
}

// Routes //

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { active } = req.query;
        const battle = await Battle.findById(battleId);

        if ( battle ) {
            // Don't include each viewers votes to save on memory
            const viewers = battle.viewers.map(v => ({
                phoneNumber: v.phoneNumber,
                name: v.name,
                userType: v.userType,
                joinedOn: v.joinedOn,
                leftOn: v.leftOn
            }));
            if ( active === 'true' ) {
                const activeViewers = viewers.filter(v => !v.leftOn )
                return res.status(201).send({viewers: activeViewers})
            } else {
                return res.status(201).send({viewers: viewers})
            }
        } else {
            return res.status(404).send("Not Found")
        }
    })

    app.post(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { phoneNumber, name, userType } = req.body;

        if ( phoneNumber && name && userType ) {
            const battle = await Battle.findById(battleId);

            if ( battle ) {
                const viewerInBattle = await isViewerInBattle(battleId, phoneNumber);

                if ( viewerInBattle ) {
                    const viewer = await handleExistingViewer(battleId, phoneNumber, name);
                    return res.status(201).send(viewer)
                } else {
                    const viewer = {
                        phoneNumber,
                        name,
                        userType,
                        joinedOn: Date.now(),
                        leftOn: null,
                        votes: Array(battle.roundCount).fill().map((_, idx) => idx + 1).map(num => ({round: num, player: null}))
                    }
                    addViewer(battleId, viewer)
                    return res.status(201).send(viewer)
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
        const { phoneNumber, reason } = req.query;

        if ( phoneNumber && reason ) {
            const battle = await Battle.findById(battleId);
            
            if ( battle ) {
                const updatedBattle = await Battle.updateOne(
                    { "_id": battleId, "viewers.phoneNumber": phoneNumber },
                    { "$set": {"viewers.$.leftOn": Date.now()}}
                );
                await pusher.bootViewer(battleId, phoneNumber, reason)
                return res.status(201).send("OK");
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber and reason required")
        }
    })
}