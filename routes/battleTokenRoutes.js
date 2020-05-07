const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const ENV = process.env.ENV

module.exports = ( app ) => {
    app.get(`/api/token`, async (req, res) => {
        const { phoneNumber } = req.query;

        if ( ENV === 'PROD') {
            client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
             .verifications
             .create({to: `+${phoneNumber}`, channel: 'sms'})
             .then(verification => {
                return res.status(200).send(verification.status)
             })
        } else {
            return res.status(200).send('pending')
        }
    })

    app.post(`/api/token`, async (req, res) => {
        const { phoneNumber, verificationCode } = req.body;

        if ( ENV === 'PROD') {
            client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks
            .create({to: `+${phoneNumber}`, code: verificationCode})
            .then(verification_check => {
                return res.status(200).send(verification_check.status)
            });
        } else {
            return res.status(200).send('approved')
        }
    })
}