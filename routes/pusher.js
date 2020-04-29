const Pusher = require('pusher');

const pusher =  new Pusher({
    appId: process.env.REACT_APP_PUSHER_APP_ID,
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    secret: process.env.REACT_APP_PUSHER_APP_SECRET,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    useTLS: true
});

module.exports = {
    bootViewer: async (battleId, phoneNumber, reason) => {
        pusher.trigger(battleId, 'boot-viewer', {
            phoneNumber: phoneNumber,
            reason: reason
        });
    },
    addViewer: (battleId, viewer) => {
        pusher.trigger(battleId, 'new-viewer', {
            viewer: viewer
        })
    },
    addComment: async (battleId, comment) => {
        pusher.trigger(battleId, 'new-comment', {
            comment: comment
        })
    },
    endBattle: async battleId => {
        pusher.trigger(battleId, 'end-battle', {
            battleId: battleId
        })
    },
    startBattle: async (battleId, currentTurn) => {
        pusher.trigger(battleId, 'start-battle', {
            currentTurn: currentTurn
        })
    },
    nextTurn: async (battleId, data) => {
        pusher.trigger(battleId, 'next-turn', data)
    }
}