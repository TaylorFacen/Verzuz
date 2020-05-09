const { sendBattleVerificationCode, verifyBattleVerificationCode } = require('./communications');

module.exports = ( app ) => {
    app.get(`/api/token`, async (req, res) => {
        const { phoneNumber } = req.query;
        const status = await sendBattleVerificationCode(phoneNumber);

        return res.status(200).send(status)
    })

    app.post(`/api/token`, async (req, res) => {
        const { phoneNumber, verificationCode } = req.body;
        const status = await verifyBattleVerificationCode(phoneNumber, verificationCode);

        return res.status(200).send(status)
    })
}