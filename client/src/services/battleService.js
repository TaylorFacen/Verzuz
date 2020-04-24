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
    addViewer: async ( battleId, phoneNumber, userType, name ) => {
        let res = await axios.post(`/api/battles/${battleId}/viewers`, { phoneNumber: phoneNumber, userType: userType, name: name})
        return res.data || {};
    },
    getViewers: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}/viewers`)
        return res.data || {};
    },
    addSubscriber: async (battleId, phoneNumber ) => {
        let res = await axios.post(`/api/battles/${battleId}/subscribers`, {phoneNumber: phoneNumber} )
        return res.data || {};
    },
    getComments: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}/comments`);
        return res.data || {};
    },
    postComments: async (battleId, data) => {
        let res = await axios.post(`/api/battles/${battleId}/comments`, data);
        return res.data || {};
    }
}