import axios from 'axios';

class User {
    constructor(battleId, userId, userType){
        this.id = userId;
        this.userType = userType;

        if ( userType === 'player' ) {
            axios.get(`/api/battles/${battleId}/players?userId=${userId}`)
            .then(res => {
                const player = res.data;
                this.name = player.name;
                this.email = player.email

            })
        } else {
            axios.get(`/api/battles/${battleId}/viewers?userId=${userId}`)
            .then(res => {
                const viewer = res.data;
                this.phoneNumber = viewer.phoneNumber;
                this.name = viewer.name;
                this.joinedOn = viewer.joinedOn;
                this.leftOn = viewer.leftOn;
                this.votes = viewer.voties
            })
        }
    }

    set updatedVote(data){
        const { round, playerId } = data;
        this.votes.filter(vote => vote.round === round).playerId = playerId;
    }
}

class Battle {
    constructor(battleId){
        this.id = battleId;
        this.baseUrl = `/api/battles/${battleId}`
    }

    init = async () => {
        try {
            const response = await axios.get(this.baseUrl);
            const battle = response.data;
            this.isBattle = true
            this.name = battle.name;
            this.startedOn = battle.startedOn;
            this.endedOn = battle.endedOn;
            this.players = battle.players;
            this.roundCount = battle.roundCount;
            this.audienceLimit = battle.audienceLimit;
            this.subscribers = battle.subscribers;
            this.blacklist = battle.blacklist;
            this.currentRound = battle.currentRound;
            this.currentTurn = battle.currentTurn;
            this.previousTurn = battle.previousTurn;
            this.createdOn = battle.createdOn;
            this.viewer = battle.viewers;
            this.comments = battle.comments;
        } catch (error ) {
            if ( error?.response?.status === 404 ) {
                this.isBattle = false
            } else {
                console.log(error)
            }
        }
    }

    postComment = async (user, text) => {
        const res = await axios.post(`${this.baseUrl}/comments`, {userId: user.id, name: user.name, text});
        return res.data || {};
    }

    postSubscriber = async (phoneNumber) => {
        const res = await axios.post(`${this.baseUrl}/subscribers`, {phoneNumber} )
        return res.data || {};
    }

    postViewer = async (name, phoneNumber ) => {
        const res = axios.post(`${this.baseUrl}/viewers`, { name, phoneNumber, userType: "viewer" })
        return res.data
    }

    leaveBattle = async userId => {
        const reason = "user exit"
        const res = await axios.delete(`${this.baseUrl}/viewers?userId=${userId}&reason=${reason}`)
        return res.data || {};
    }

    removeViewer = async userId => {
        const viewers = this.viewers || [];
        const updatedViewers = viewers.filter(viewer => viewer._id !== userId);
        this.updatedBattleData = { viewers: updatedViewers }
    }

    start = async () => {
        axios.post(`${this.baseUrl}/start`)
        .then(res => {
            const currentTurn = res.data;
            this.updatedBattleData = { startedOn: Date.now(), currentRound: 1, currentTurn}
        })
        .catch(error => console.log(error))
    }

    end = async () => {
        axios.post(`${this.baseUrl}/end`)
        .then(res => {
            const votes = res.data;
            this.updatedBattleData = { votes, endedOn: Date.now() }
        })
        .catch(error => console.log(error))
    }

    nextTurn = async () => {
        axios.post(`${this.baseUrl}/next`)
        .then(res => {
            this.updatedBattleData = res.data;            
        })
        .catch(error => console.log(error))
    }

    vote = async ( playerId, round, user ) => {
        axios.post(`${this.baseUrl}/votes`, { playerId, round, userId: user.id })
        .then(async () => {
            // Update user object with new vote
            user.updatedVote = { round, playerId}
            return user
        })
    }

    getVerificationCode = async phoneNumber => {
        const res = await axios.get(`/api/token?phoneNumber=${phoneNumber}`);
        return res.data;
    }

    checkVerificationCode = async ( phoneNumber, verificationCode ) => {
        const res = await axios.post(`/api/token`, {phoneNumber, verificationCode})
        return res.data
    }

    // Getters
    get viewerCount(){
        // Return a count of active viewers
        return this.viewers.filter(v => !v.leftOn).length
    }

    get winnersByRound(){
        const votes = this.votes.map(vote => ({
            round: vote.round,
            player: this.players.find(player => player._id === vote.player),
            votes: vote.viewers.length
        }));

        const rounds = Array.from(new Set(votes.map(vote => vote.round)));

        const winnersByRound = rounds.map(round => {
            const roundVotes = votes.filter(vote => vote.round === round);
            const rankedRoundVotes = roundVotes.sort((a, b) => a.votes - b.votes)

            return {
                round,
                // Making this flexible just in case there's a tie
                winners: rankedRoundVotes.filter(v => v.votes > 0 && v.votes === rankedRoundVotes[0]?.votes)
            }
        }).sort((a, b) => a.round - b.round)

        return winnersByRound
    }

    get playerScores(){
        const winnersByRound = this.winnersByRound;
        const players = this.players;

        const playerScores = players.map(player => ({
            player: player,
            score: winnersByRound.filter(w => w.winners.map(winner => winner._id).includes(player._id)).length
        }))
        
        return playerScores
    }

    get winner(){
        const playerScores = this.playerScores;
        const rankedPlayerScores = playerScores.sort((a, b) => a.score - b.score);

        if ( rankedPlayerScores[0]?.score === rankedPlayerScores[1]?.score ) {
            return "tie"
        } else {
            return rankedPlayerScores[0]
        }
    }

    // Setters
    set updatedBattleData(data) {
        for (let [key, value] of Object.entries(data)) {
            if (value) {
                this[key] = value
            }
        }
    }

    set newComment(comment) {
        const comments = this.comments || [];
        this.comments = comments.filter(c => c._id !== comment._id).concat([comment])
    }

    set newViewer(viewer) {
        const viewers = this.viewers || [];
        const comment = {
            createdOn: Date.now(),
            text: "joined",
            name: viewer.name,
            userId: "system",
            _id: Math.random().toString(36).substr(2, 10).toUpperCase()
        }
        this.viewers = viewers.filter(v => v.phoneNumber !== viewer.phoneNumber).concat([viewer])
        this.newComment = comment
    }
}

export { User, Battle }