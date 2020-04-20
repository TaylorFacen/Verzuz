import axios from 'axios';

export default {
    getRoom: async roomId => {
        let res = await axios.get(`api/rooms/${roomId}`);
        return res.data || {};
    },
    createRoom: async data => {
        let res = await axios.post(`api/rooms`, data);
        return res.data || {};
    }

}