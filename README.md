# Verzuz App

[App URL](https://www.verzuz.app/)

## About
These past few months, Timbaland and Swizz Beats have been hosting online music battles via Instagram. Although this platform is great, I thought I'd take a shot and build a Verzuz app to better facilitate comments, voting, and battling.

### How it Works
First you create a battle and invite your opponent. Then you will both be sent an invitation email using Twilio's Sendgrid API. When you're ready, join your battle room to test your audio and video. Once you've started your battle, anyone with your room's link can join. Viewers can comment and vote on their pick each round. 

## Features
* Host your own battles
* Join the battle early to test your audio and video before viewers join
* Viewers can comment in real-time
* Viewers can vote in real-time
* No spammers! Viewers have to sign in with their phone number (verified through Twilio Verify)

## Set Up
Want to set up Verzuz on your own? Here are the accounts you'll need and their associated environment variables
1. A Twilio account - For Sendgrid and Verify
    * TWILIO_ACCOUNT_SID
    * TWILIO_AUTH_TOKEN
    * TWILIO_VERIFY_SERVICE_SID
    * SENDGRID_API_KEY

2. A Pusher account - For real time comments and events
    * REACT_APP_PUSHER_APP_ID
    * REACT_APP_PUSHER_APP_KEY
    * REACT_APP_PUSHER_APP_SECRET
    * REACT_APP_PUSHER_APP_CLUSTER

3. An Agora account - To set up the video and audio stream
    * REACT_APP_AGORA_APP_ID

To run locally, 

1. Clone the repository and `cd` into it

```bash
git clone git@github.com:TaylorFacen/Verzuz.git
cd Verzuz
```

2. Install dependencies

```bash
npm install
```

3. Set your environment variables

```
.env
MONGODB_URI

REACT_APP_PUSHER_APP_ID
REACT_APP_PUSHER_APP_KEY
REACT_APP_PUSHER_APP_SECRET
REACT_APP_PUSHER_APP_CLUSTER

SENDGRID_API_KEY

ENV=DEV

TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
```

```
client/.env
REACT_APP_PUSHER_APP_ID
REACT_APP_PUSHER_APP_KEY
REACT_APP_PUSHER_APP_SECRET
REACT_APP_PUSHER_APP_CLUSTER 

REACT_APP_AGORA_APP_ID
```

4. Start the server

```bash
npm run dev
```

5. Navigate to [http://localhost:3000](http://localhost:3000)