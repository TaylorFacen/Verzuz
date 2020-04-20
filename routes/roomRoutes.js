const mongoose = require('mongoose');
const Room = mongoose.model('rooms');

module.exports = ( app ) => {
    app.get(`/api/rooms`, async (req, res) => {
        let rooms = await Room.find({}, {
            "_id": 1,
            "name": 1,
            "createdOn": 1
        });
        return res.status(200).send(rooms);
    });

    app.post(`/api/rooms`, async (req, res) => {
        let room = await Room.create(req.body);
        return res.status(201).send({
            error: false,
            room
        })
    })

    app.get(`/api/rooms/:roomId`, async (req, res) => {
        const { roomId } = req.params;

        let room = await Room.findById(roomId);

        return res.status(200).send(room)
    })

    app.put(`/api/rooms/:roomId`, async (req, res) => {
        const { roomId } = req.params;

        let room = await Room.findByIdAndUpdate(roomId, req.body);

        return res.status(202).send({
            error: false,
            room
        })
    })

    app.delete(`/api/rooms/:roomId`, async (req, res) => {
        const { roomId } = req.params;

        await Room.findByIdAndDelete(roomId);

        return res.status(202).send({
            error: false
        })
    })
}