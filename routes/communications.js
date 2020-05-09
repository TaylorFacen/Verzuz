const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const CLIENT_URL = process.env.CLIENT_URL

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendBattleStartMessage = async (battle) => {
    const battleName = battle.name;
    const battleId = battle._id;
    const subscribers = battle.subscribers;
    const battleUrl = `${CLIENT_URL}/battles/${battleId}`

    const message = `${battleName} just started! Join the battle by heading to ${battleUrl}`;

    return subscribers.map(phoneNumber => (
        client.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: '+' + phoneNumber
        })
    ))
}

module.exports = { sendBattleStartMessage }