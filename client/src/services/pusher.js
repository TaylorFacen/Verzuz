import Pusher from 'pusher-js';

import battleService from './battleService';

class PusherClient {
    constructor() {
        this.pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
            cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
            encrypted: true
        })
    }

    subscribeToChannel = battleId => {
        const channel = this.pusher.subscribe(battleId);

        this.channel = channel;
        this.battleId = battleId;
    }

    unsubscribeFromChannel = battleId => {
        this.pusher.unsubscribe(battleId);
    }

    subscribeToNewViewerEvent = callback => {
        this.channel.bind('new-viewer', data => {
            const { viewer } = data;
            const comment = {
                createdOn: Date.now(),
                text: "joined",
                name: viewer.name,
                userId: "system",
                _id: Math.random().toString(36).substr(2, 10).toUpperCase()
            }

            const newViewer = {
                ...viewer,
                leftOn: null
            }
            callback(comment, newViewer)
        })
    }

    subscribeToBootViewerEvent = callback => {
        this.channel.bind('boot-viewer', data => {
            const { phoneNumber, reason } = data;
            callback(phoneNumber, reason)
        })
    }

    subscribeToNewCommentEvent = callback => {
        this.channel.bind('new-comment', data => {
            const { comment } = data;
            
            callback(comment)
        })
    }

    subscribeToBattleStartedEvent = callback => {
        this.channel.bind('start-battle', data => {
            const { currentTurn } = data;
            callback(currentTurn)
        })
    }

    subscribeToBattleEndedEvent = callback => {
        this.channel.bind('end-battle', data => callback(data))
    }

    subscribeToNextTurnEvent = callback => {
        this.channel.bind('next-turn', async data => {
            const { currentRound, currentTurn, previousTurn, scores } = data;
            const winnerByRound = await battleService.calculateWinnerByRound(scores);

            callback(currentRound, currentTurn, previousTurn, winnerByRound)
        })
    }
}

export default PusherClient;