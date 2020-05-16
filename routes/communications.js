const CLIENT_URL = process.env.CLIENT_URL
const ENV = process.env.ENV
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

const sendBattleVerificationCode = async phoneNumber => {
    if ( ENV === 'PROD') {
        client.verify.services(TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
            to: `+${phoneNumber}`,
            channel: 'sms'
        })
        .then(verification => {
            return verification.status
        })
    } else {
        return 'pending'
    }
}

const sendBattleInvites = async battle => {
    const participants = battle.participants;
    participants.forEach(participant => {
        const data = {
            "name": participant.name,
            "battleName": battle.name,
            "roundCount": battle.roundCount,
            "opponentName": participants.find(p => p.email !== participant.email).name,
            "audienceLimit": battle.audienceLimit,
            "viewerLink": `${CLIENT_URL}/battles/${battle._id}/join`,
            "playerLink": `${CLIENT_URL}/battles/${battle._id}/host`,
            "accessCode": participant.accessCode
        }

        const msg = {
            to: participant.email,
            from: 'hello@verzuz.app',
            templateId: 'd-89100ea50b9843789efe286cee700a80',
            dynamic_template_data: data,
            customArgs: {
                env: ENV
            }
        };

        sgMail.send(msg);
    })
    
}

const sendBattleStartMessage = async battle => {
    const battleName = battle.name;
    const battleId = battle._id;
    const subscribers = battle.subscribers;
    const battleUrl = `${CLIENT_URL}/battles/${battleId}`

    const message = `${battleName} just started! Join the battle by heading to ${battleUrl}`;
    return subscribers.map(phoneNumber => (
        client.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: `+${phoneNumber}`
        })
    ))
}

const verifyBattleVerificationCode = async ( phoneNumber, verificationCode ) => {
    if ( ENV === 'PROD' ) {
        client.verify.services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
            to: `+${phoneNumber}`,
            code: verificationCode
        })
        .then(verificationCheck => {
            return verificationCheck.status
        })
    } else {
        return 'approved'
    }
}

module.exports = { sendBattleVerificationCode, sendBattleInvites, sendBattleStartMessage, verifyBattleVerificationCode }