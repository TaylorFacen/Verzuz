import Pusher from 'pusher-js';

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
            callback(viewer)
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
        this.channel.bind('end-battle', data => {
            const { votes } = data;
            callback(votes)
        })
    }

    subscribeToNextTurnEvent = callback => {
        this.channel.bind('next-turn', async data => {
            const { currentRound, currentTurn, previousTurn, votes } = data;

            callback(currentRound, currentTurn, previousTurn, votes)
        })
    }
}

export default PusherClient;