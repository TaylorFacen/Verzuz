import React, { Component } from "react";
import { Row, Col, Button } from 'react-bootstrap';
import Pusher from 'pusher-js';
import AgoraRTC from 'agora-rtc-sdk'

import './BattleRoom.css';
import CommentsSection from './CommentsSection';
import CurrentRound from './CurrentRound';
import Navigation from './Navigation';
import PlayerControls from './PlayerControls';
import PlayerScore from './PlayerScore';
import VideoPlayer from './VideoPlayer';
import ViewerCount from './ViewerCount';
import VoteButton from './VoteButton';

import battleService from '../../services/battleService';
import parseCookie from '../../services/parseCookie';


class BattleRoom extends Component {
    state = {
        battleName: '',
        isLoading: true,
        phoneNumber: '',
        userType: '',
        name: '',
        comments: [],
        viewers: [],
        participants: [],
        currentRound: 1,
        currentTurn: '',
        previousTurn: '',
        roundCount: null,
        isMediaPlaying: false
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const cookieData = cookieResp.data;

            // Set the user
            this.setUser(battleId, cookieData)
            .then(async () => {
                // Start pusher subscriptions
                await this.startPushSubscription(battleId, cookieData.phoneNumber || cookieData.email)

                // Get data
                await this.getData(battleId)

                // Start Media subscriptions
                await this.startMediaSubscription(battleId, cookieData.userType, cookieData.email || cookieData.phoneNumber);

            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    async startMediaSubscription(battleId, userType, uid){
        battleService.getBattle(battleId)
        .then(battle => {
            // rtc object
            const rtc = {
                client: null,
                joined: false,
                published: false,
                localStream: null,
                remoteStreams: [],
                params: {}
            };

            // Create a client
            rtc.client = AgoraRTC.createClient({mode: "live", codec: "h264"});
            rtc.client.setClientRole(userType === "player" ? "host" : "audience"); 

            // Initialize the client
            const agoraAppId = process.env.REACT_APP_AGORA_APP_ID
            rtc.client.init(agoraAppId, () => {
                // Join a channel
                rtc.client.join(null, battle.name, uid, uid => {
                    rtc.params.uid = uid;

                    if ( userType === "player" ) {
                        // Create a local stream
                        rtc.localStream = AgoraRTC.createStream({
                            streamID: rtc.params.uid,
                            audio: true,
                            video: true,
                            screen: false,
                        })

                        // Initialize the local stream
                        rtc.localStream.init(async () => {
                            rtc.client.publish(rtc.localStream, function (err) {
                                console.log("publish failed");
                                console.error(err);
                            })
                        }, function (err) {
                            console.error("init local stream failed ", err);
                        });
                    }

                    rtc.client.on("stream-added", function (evt) {  
                        var remoteStream = evt.stream;
                        var id = remoteStream.getId();
                        if (id !== rtc.params.uid) {
                            rtc.client.subscribe(remoteStream, function (err) {
                            console.log("stream subscribe failed", err);
                            })
                        }
                    });

                    rtc.client.on("stream-subscribed", function (evt) {
                        var remoteStream = evt.stream;
                        var id = remoteStream.getId();

                        // Play the remote stream.
                        remoteStream.play("remote_video_" + id);
                    })
                    
                    this.setState({
                        rtc: rtc
                    })

                }, function(err) {
                    console.error("client join failed", err)
                })
                }, (err) => {
                console.error(err);
            });

            
        })

    }

    async togglePlayMedia(){
        const { rtc, isMediaPlaying } = this.state;

        if ( isMediaPlaying ) {
            rtc.localStream.stop();
            this.setState({
                isMediaPlaying: false
            })
        } else {
            // play stream with html element id "local_stream"
            rtc.localStream.play("local_stream");
            this.setState({
                isMediaPlaying: true
            })   
        }

    }

    async startPushSubscription(battleId, contact){
        const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
            cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
            encrypted: true
        });
        const channel = pusher.subscribe(battleId);

        // New Viewer
        channel.bind('new-viewer', data => {
            const { viewer } = data;
            const comment = {
                createdOn: Date.now(),
                text: "joined",
                name: viewer.name,
                userId: "system",
                _id: Math.random().toString(36).substr(2, 10).toUpperCase()
            }

            const newViewer = {
                phoneNumber: viewer.phoneNumber,
                name: viewer.name,
                userType: viewer.userType,
                joinedOn: viewer.joinedOn,
                leftOn: null
            }

            this.setState(prevState => {
                const { comments, viewers } = prevState;
                // Makes sure not to include duplicate contacts
                const allComments = comments.filter(c => c._id !== comment._id)
                allComments.push(comment);

                const allViewers = viewers.filter(v => v.phoneNumber !== viewer.phoneNumber)
                allViewers.push(newViewer)

                return {
                    comments: allComments,
                    viewers: allViewers
                }
            })
        })

        // Boot User
        channel.bind('boot-viewer', data => {
            if ( contact === data.phoneNumber ) {
                // Remove all subscriptions
                pusher.unsubscribe(battleId)

                // Display boot reason (e.g. New session, blocked from battle, battle ended), left battle
            } else {
                // Decrease the viewer count
                this.setState(prevState => ({
                    viewers: prevState.viewers.filter(v => v.phoneNumber !== data.phoneNumber)
                }))
            }
        })

        // New Comment
        channel.bind('new-comment', data => {
            const { comment } = data;

            this.setState(prevState => {
                const { comments } = prevState;
                const otherComments = comments.filter(c => c._id !== comment._id)
                const allComments = otherComments.concat([comment])

                return { comments: allComments }
            })
        })

        // Battle Started
        channel.bind('start-battle', data => {
            this.setState({
                currentTurn: data.currentTurn,
                currentRound: 1,
                startedOn: Date.now()
            })
        })

        // Battle Ended
        channel.bind('end-battle', data => {
            console.log("Battle ended")
        })

        // Next Turn
        channel.bind('next-turn', data => {
            const { currentRound, currentTurn, previousTurn, scores } = data;
            const winnerByRound = Array.from(new Set(scores.map(score => score.round))).map(round => {
                const roundScores = scores.filter(score => score.round === round && !!score.player);
                const roundWinner = roundScores.reduce((winner, player) => player.votes > winner.votes ? player : winner, roundScores[0]);
                return {
                    round: round,
                    winner: roundWinner.player                    
                }
            });
            this.setState({
                currentRound,
                currentTurn,
                previousTurn,
                scores: winnerByRound
            })
        })
    }

    async setUser(battleId, cookieData) {
        const { userType, name, email, phoneNumber } = cookieData

        if (userType === 'player') {
            this.setState(() => ({
                    name: name,
                    email: email,
                    userType: userType
                })
            )
        } else {
            battleService.addViewer(battleId, phoneNumber, userType, name)
            .then(viewer => {
                this.setState(prevState => {
                    // Add user as a viewer
                    const viewers = prevState.viewers;
                    viewers.push({
                        phoneNumber: phoneNumber,
                        name: name,
                        userType: userType,
                        joinedOn: Date.now(),
                        leftOn: null
                    })
                    // Make sure viewers are unique
                    const uniqueViewers = Array.from(new Set(viewers.map(v => v.phoneNumber)))
                    .map(phoneNumber => viewers.find(v => v.phoneNumber === phoneNumber))
                    return {
                        phoneNumber: phoneNumber,
                        email: email,
                        name: name,
                        userType: userType,
                        viewers: uniqueViewers,
                        userVotes: viewer.votes
                    }
                })
            })
            .catch(error => console.log(error))
        }
    }

    async getData(battleId){
        // Battle Data
        const battlePromise =  battleService.getBattle(battleId);
        
        // Viewers
        const viewersPromise =  battleService.getViewers(battleId, true);

        // Comments
        const commentsPromise =  battleService.getComments(battleId)

        Promise.all([battlePromise, viewersPromise, commentsPromise])
        .then(responses => {
            const battle = responses[0];
            const viewers = responses[1].viewers;
            const comments = responses[2].comments   

            this.setState(prevState => {
                // Make sure there are no duplicates
                const allViewers = prevState.viewers.concat(viewers);
                const uniqueViewers = Array.from(new Set(allViewers.map(v => v.phoneNumber)))
                .map(phoneNumber => allViewers.find(v => v.phoneNumber === phoneNumber))

                const allComments = prevState.comments.concat(comments);
                const uniqueComments = Array.from(new Set(allComments.map(c => c._id)))
                .map(id => allComments.find(c => c._id === id))

                // Calculate winner for each round
                const scores = battle.scores;

                const winnerByRound = Array.from(new Set(battle.scores.map(score => score.round))).map(round => {
                    const roundScores = scores.filter(score => score.round === round && !!score.player);
                    const roundWinner = roundScores.reduce((winner, player) => player.votes > winner.votes ? player : winner, roundScores[0]);
                    return {
                        round: round,
                        winner: roundWinner?.player                    
                    }
                });

                return {
                    viewers: uniqueViewers,
                    battleName: battle.name,
                    participants: battle.participants,
                    roundCount: battle.roundCount,
                    currentRound: battle.currentRound,
                    currentTurn: battle.currentTurn,
                    previousTurn: battle.previousTurn,
                    comments: uniqueComments,
                    startedOn: battle.startedOn,
                    endedOn: battle.endedOn,
                    scores: winnerByRound,
                    isLoading: false
                }
            })
        })
    }

    leaveBattle = reason => {
        const { userType, phoneNumber, rtc } = this.state;
        const battleId = this.props.match.params.battleId.toUpperCase();

        if ( userType === 'player') {
            console.log("Player leaves")
        } else {
            battleService.deleteViewer(battleId, phoneNumber, reason )
            .then(() => {
                // Remove cookie
                document.cookie = "verzuz=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            })
            .catch(error => console.log(error.response) )
        }

        // Leave the channel
        rtc.client.leave(function () {
            // Stop playing the local stream
            rtc.localStream.stop();
            // Close the local stream
            rtc.localStream.close();
            // Stop playing the remote streams and remove the views
            while (rtc.remoteStreams.length > 0) {
            var stream = rtc.remoteStreams.shift();
            stream.stop();
            }
            console.log("client leaves channel success");
        }, function (err) {
            console.log("channel leave failed");
            console.error(err);
        })
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    async startBattle(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const { participants } = this.state;

        const currentTurnParticipant = participants[0];

        battleService.startBattle(battleId, currentTurnParticipant.email)
        .then(() => {
            this.setState({
                startedOn: Date.now(),
            })
        })
        .catch(error => console.log(error))
    }

    async endBattle(){
        const battleId = this.props.match.params.battleId.toUpperCase();

        battleService.endBattle(battleId)
        .then(() => {
            this.setState({
                endedOn: Date.now()
            })
        })
        .catch(error => console.log(error))
    }

    finishTurn(){
        const battleId = this.props.match.params.battleId.toUpperCase()
        battleService.nextTurn(battleId)
    }

    castVote = player => {
        const battleId = this.props.match.params.battleId.toUpperCase();
        const { userVotes, currentRound, phoneNumber } = this.state;

        battleService.castVote(battleId, phoneNumber, currentRound, player )
        .then(() => {
            userVotes.find(vote => vote.round === currentRound).player = player;
            this.setState({
                userVotes
            })
        })
    }

    render(){
        const { battleName, startedOn, endedOn, currentTurn, currentRound, roundCount } = this.state;
        const { viewers, comments, participants, scores } = this.state;
        const { isLoading, name, phoneNumber, email, userType, userVotes, isMediaPlaying } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                <Navigation 
                    battleName = { battleName }
                    battleId = { this.props.match.params.battleId.toUpperCase() }
                    leaveBattle = { this.leaveBattle.bind(this) }
                />
                <Row className = "battle">
                    <Col xl = {9} lg = {9} md = {9} sm = {12} xs = {12} className = "battle-room-details">
                        <Row className = "round">
                            <CurrentRound 
                                currentRound = { currentRound }
                                roundCount = { roundCount }
                                scores = { scores }
                                participants = { participants }
                            />
                        </Row>
                        <Row className = "participants">
                            { participants.map(p => {
                                const isActive = currentTurn === p.email && ( currentRound <= roundCount );
                                const isCurrentVote = !!userVotes && userVotes.find(v => v.round === (currentRound > roundCount ? currentRound - 1 : currentRound)).player === p.email;
                                const displayFinishTurnButton = isActive && email === p.email && currentRound <= roundCount;
                                const score = scores.filter(score => score.winner === p.email).length;

                                return (
                                    <Col key = { p.email } >
                                        <VideoPlayer 
                                            playerName = { p.name } 
                                            isActive = { isActive }
                                            videoPlayerId = { p.email === email ? "local_stream" : `remote_video_${p.email}` }
                                            isMediaPlaying = { isMediaPlaying }
                                            togglePlayMedia = { this.togglePlayMedia.bind(this) }
                                        />
                                        <PlayerScore score = { score } />

                                        { displayFinishTurnButton ? (
                                            <Button className = "cta" onClick = { this.finishTurn.bind(this) }>
                                                Finish Turn
                                            </Button>
                                        ) : null }

                                        { userType !== "player" && currentRound <= roundCount ? (
                                            <VoteButton 
                                                isCurrentVote = { isCurrentVote }
                                                castVote = {() => this.castVote(p.email) }
                                            />
                                        ) : null }
                                    </Col>
                                )
                            })}
                        </Row>
                        { userType === 'player' ? (
                            <PlayerControls 
                                startedOn = { startedOn }
                                endedOn = { endedOn }
                                startBattle = { this.startBattle.bind(this) }
                                endBattle = { this.endBattle.bind(this) }
                            />
                        ) : null}
                    </Col>
                    <Col xl = {3} lg = {3} md = {3} sm = {12} xs = {12} className = "battle-room-social">
                        <ViewerCount viewers = { viewers } />
                        <CommentsSection 
                            comments = { comments } 
                            name = { name } 
                            userId = { phoneNumber || email }
                            battleId = { this.props.match.params.battleId.toUpperCase() }
                        />
                    </Col>
                </Row>
            </div>
        ) : null
    }
}

export default BattleRoom;