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
            { "$unset": { "viewers.$.leftOn": 1}, "$set": {"viewers.$.name": name}}
        );

        const resp = pusher.addViewer(battleId, viewer);
        return {updatedBattle, resp}
    } else {
        const updatedBattle = await Battle.updateOne(
            { "_id": battleId, "viewers.phoneNumber": phoneNumber },
            { "$set": {"viewers.$.name": name}}
        );

        const resp = pusher.bootViewer(battleId, phoneNumber, 'new session');
        return { resp }
    }
}

// Routes //

module.exports = ( app ) => {
    app.get(`/api/battles/:battleId/viewers`, async (req, res) => {
        const { battleId } = req.params;
        const { active } = req.query;
        const battle = await Battle.findById(battleId);

        if ( battle ) {
            const viewers = battle.viewers;
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
                    handleExistingViewer(battleId, phoneNumber, name);
                    return res.status(201).send("OK")
                } else {
                    const viewer = {
                        phoneNumber,
                        name,
                        userType,
                        joinedOn: Date.now(),
                        leftOn: null
                    }
                    addViewer(battleId, viewer)
                    return res.status(201).send("OK")
                }
            } else {
                return res.status(404).send("Not Found")
            }
        } else {
            return res.status(400).send("phoneNumber, name, and userType required")
        }
    })
}