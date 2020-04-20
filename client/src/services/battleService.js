import axios from 'axios';

export default {
    getBattle: async battleId => {
        let res = await axios.get(`/api/battles/${battleId}`);
        return res.data || {};
    },
    createBattle: async data => {
        let res = await axios.post(`/api/battles`, data);
        return res.data || {};
    }

}