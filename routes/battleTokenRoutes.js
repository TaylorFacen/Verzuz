const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = ( app ) => {
    app.get(`/api/token`, async (req, res) => {
        const { phoneNumber } = req.query;

        client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
             .verifications
             .create({to: `+${phoneNumber}`, channel: 'sms'})
             .then(verification => {
                return res.status(200).send(verification.status)
             })
    })

    app.post(`/api/token`, async (req, res) => {
        const { phoneNumber, verificationCode } = req.body;

        client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({to: `+${phoneNumber}`, code: verificationCode})
        .then(verification_check => {
            return res.status(200).send(verification_check.status)
        });
    })
}