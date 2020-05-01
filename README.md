# Verzuz App

[Verzuz App](https://www.verzuz.app/)

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