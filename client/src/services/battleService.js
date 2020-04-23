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
    getViewers: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}/viewers`)
        return res.data || {};
    },
    addSubscriber: async (battleId, phoneNumber ) => {
        let res = await axios.post(`/api/battles/${battleId}/subscribers`, {phoneNumber: phoneNumber} )
        return res.sata || {};
    }
}