import axios from 'axios';

export default {
    getAllBattles: async () => {
        let res = await axios.get('/api/battles');
        return res.data || [];
    },
    getBattle: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}`);
        return res.data || {};
    },
    createBattle: async data => {
        let res = await axios.post(`/api/battles`, data);
        return res.data || {};
    },
    startBattle: async (battleId, participantEmail) => {
        let res = await axios.post(`/api/battles/${battleId}/start`, { currentTurn: participantEmail});
        return res.data || {};
    },
    endBattle: async battleId => {
        let res = await axios.post(`/api/battles/${battleId}/end`);
        return res.data || {};
    },
    nextTurn: async battleId => {
        let res = await axios.post(`/api/battles/${battleId}/next`);
        return res.data || {};
    },
    addViewer: async ( battleId, phoneNumber, userType, name ) => {
        let res = await axios.post(`/api/battles/${battleId}/viewers`, { phoneNumber, userType, name})
        return res.data || {};
    },
    deleteViewer: async (battleId, phoneNumber, reason ) => {
        if ( phoneNumber ) {
            const encodedPhoneNUmber = phoneNumber.replace('+', '%2b')
            let res = await axios.delete(`/api/battles/${battleId}/viewers?phoneNumber=${encodedPhoneNUmber}&reason=${reason}`)
            return res.data || {};
        }
    },
    getViewers: async (battleId, active = true) => {
        let res = await axios.get(`/api/battles/${battleId}/viewers?active=${active}`)
        return res.data || {};
    },
    addSubscriber: async (battleId, phoneNumber ) => {
        let res = await axios.post(`/api/battles/${battleId}/subscribers`, {phoneNumber} )
        return res.data || {};
    },
    getComments: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}/comments`);
        return res.data || {};
    },
    postComment: async (battleId, userId, name, text) => {
        let res = await axios.post(`/api/battles/${battleId}/comments`, {userId, name, text});
        return res.data || {};
    },
    castVote: async (battleId, phoneNumber, currentRound, player) => {
        let res = await axios.post(`/api/battles/${battleId}/votes`, { phoneNumber, currentRound, player });
        return res.data || {};
    },
    getVerificationCode: async phoneNumber => {
        let res = await axios.get(`/api/token?phoneNumber=${phoneNumber}`)
        return res.data || {}
    },
    checkVerificationCode: async (phoneNumber, verificationCode) => {
        let res = await axios.post(`/api/token`, {phoneNumber, verificationCode})
        return res.data || {}
    }
}