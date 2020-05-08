import React, { Component } from "react";
import { Row, Col, Button } from 'react-bootstrap';

import './BattleRoom.css';
import BattleEndedModal from './BattleEndedModal';
import CommentsSection from './CommentsSection';
import CurrentRound from './CurrentRound';
import Navigation from './Navigation';
import PlayerControls from './PlayerControls';
import PlayerScore from './PlayerScore';
import VideoPlayer from './VideoPlayer';
import ViewerCount from './ViewerCount';
import VoteButton from './VoteButton';

import AgoraClient from '../../services/agora';
import battleService from '../../services/battleService';
import cookieService from '../../services/cookieService';
import PusherClient from '../../services/pusher';


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
        roundCount: null
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = cookieService.parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const cookieData = cookieResp.data;


            // Set the user
            this.setUser(battleId, cookieData)
            .then(async () => {
                // Start pusher subscriptions
                await this.startPusherSubscription(battleId, cookieData.phoneNumber || cookieData.email)

                // Get data
                await this.getData(battleId)

                // Subscribe to Video / Audio Stream
                await this.startMediaSubscription(battleId, cookieData.userType, cookieData.email || cookieData.phoneNumber)
            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    async startMediaSubscription(battleId, userType, uid){
        battleService.getBattle(battleId)
        .then(battle => {
            const updateParticipantsCallback = (playerEmail, isStreaming, isAudioConnected) => {
                this.setState(prevState => {
                    const { battle } = prevState;
                    const { participants } = battle;

                    const player = participants.find(p => p.email === playerEmail);
                    const updatedPlayer = {
                        ...player,
                        isStreaming,
                        isAudioConnected
                    }

                    return {
                        battle: {
                            ...battle,
                            participants: participants.filter(p => p.email !== playerEmail).concat([updatedPlayer])
                        }
                    }
                })
            }

            const agora = new AgoraClient();
            agora.joinChannel(userType, battle.name, uid, updateParticipantsCallback)
            this.setState({
                agora
            })
        })
    }

    async startPusherSubscription(battleId, userPhoneNumber){
        const pusher = new PusherClient();
        pusher.subscribeToChannel(battleId);

        // Pusher Events
        pusher.subscribeToNewViewerEvent((comment, newViewer) => {
            this.setState(prevState => {
                const { comments, viewers } = prevState;
                // Makes sure not to include duplicate contacts
                const allComments = comments.filter(c => c._id !== comment._id).concat([comment])

                const allViewers = viewers.filter(v => v.phoneNumber !== newViewer.phoneNumber).concat([newViewer])

                return {
                    comments: allComments,
                    viewers: allViewers
                }
            })
        })

        pusher.subscribeToBootViewerEvent((phoneNumber, reason) => {
            if ( userPhoneNumber === phoneNumber ) {
                // Unsubscribe from Pusher
                pusher.unsubscribeFromChannel(battleId);

                // Unsubscribe from Agora
                const { agora } = this.state;
                agora.leaveChannel();

                // Remove Cookie
                cookieService.removeCookie()

                this.setState({
                    bootReason: reason
                })
            } else {
                // Decrease the viewer count
                this.setState(prevState => ({
                    viewers: prevState.viewers.filter(v => v.phoneNumber !== phoneNumber)
                }))
            }
        })

        pusher.subscribeToNewCommentEvent(comment => {
            this.setState(prevState => {
                const { comments } = prevState;
                // Make sure comments are unique
                const allComments = comments.filter(c => c._id !== comment._id).concat([comment])
                
                return { comments: allComments }
            })
        })

        pusher.subscribeToBattleStartedEvent(currentTurn => {
            this.setState({
                currentTurn,
                currentRound: 1,
                startedOn: Date.now()
            })
        })

        pusher.subscribeToBattleEndedEvent(async data => {
            const { agora, pusher } = this.state;

            // Get the most up to date battle info
            const battle = await battleService.getBattle(data.battleId);

            // Unsubscribe from channels
            agora.leaveChannel();
            pusher.unsubscribeFromChannel(battle._id);
            cookieService.removeCookie();

            this.setState({
                battle: {
                    ...battle,
                    endedOn: Date.now()
                }
            })
        })

        pusher.subscribeToNextTurnEvent((currentRound, currentTurn, previousTurn, winnerByRound) => {
            this.setState({
                currentRound,
                currentTurn,
                previousTurn,
                scores: winnerByRound
            })
        })

        this.setState({
            pusher
        })
    }

    async setUser(battleId, cookieData) {
        const { userType, name, email, phoneNumber } = cookieData

        if (userType === 'player') {
            const user = {
                name,
                email,
                userType
            }

            this.setState(user)
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
                    battle,
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

    async leaveBattle() {
        const { userType, phoneNumber, pusher, agora } = this.state;
        const battleId = this.props.match.params.battleId.toUpperCase();

        // Unsubscribe from Pusher
        pusher.unsubscribeFromChannel(battleId);

        // Unsubscribe from Agora
        agora.leaveChannel();

        // If not a player, "delete" viewer from battle's viewers list
        if ( userType !== 'player') {
            await battleService.deleteViewer(battleId, phoneNumber, null )
        }

        // Remove cookie
        cookieService.removeCookie()
        .then(() => window.location.replace(`/`))
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
                startedOn: Date.now()
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

    // User has to manually toggle audio due to Chrome / Safari rules
    toggleAudio = playerEmail => {
        const playerAudio = document.getElementById(`audio${playerEmail}`);
        
        playerAudio.paused ? playerAudio.play() : playerAudio.pause()

        this.setState(prevState => {
            const { battle } = prevState;
            const { participants } = battle
            const player = participants.find(p => p.email === playerEmail);

            return {
                battle: {
                    ...battle,
                    participants: participants.filter(p => p.email !== playerEmail).concat([{
                        ...player,
                        isAudioConnected: !player.isAudioConnected
                    }])
                }
            }
        })
    }

    render(){
        const { battle, viewers, comments, scores } = this.state;
        const { isLoading, name, phoneNumber, email, userType, userVotes } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                <Navigation 
                    battleName = { battle.name }
                    battleId = { battle._id }
                    leaveBattle = { this.leaveBattle.bind(this) }
                />
                <Row className = "battle">
                    <Col xl = {9} lg = {9} md = {9} sm = {12} xs = {12} className = "battle-room-details">
                        <Row className = "round">
                            <CurrentRound 
                                battle = { battle }
                                scores = { scores }
                            />
                        </Row>
                        <Row className = "participants">
                            { battle.participants.map(p => {
                                const isActive = battle.currentTurn === p.email && ( battle.currentRound <= battle.roundCount );
                                const isCurrentVote = !!userVotes && userVotes.find(v => v.round === (battle.currentRound > battle.roundCount ? battle.currentRound - 1 : battle.currentRound)).player === p.email;
                                const displayFinishTurnButton = isActive && email === p.email && battle.currentRound <= battle.roundCount;
                                const score = scores.filter(score => score.winner === p.email && score.round < battle.currentRound).length;

                                return (
                                    <Col key = { p.email } >
                                        <VideoPlayer 
                                            player = { p }
                                            isActive = { isActive }
                                            videoPlayerId = { p.email === email ? "local_stream" : `remote_video_${p.email}` }
                                            toggleAudio = { () => this.toggleAudio(p.email) }
                                        />
                                        <PlayerScore score = { score } />

                                        { displayFinishTurnButton ? (
                                            <Button className = "cta" onClick = { this.finishTurn.bind(this) }>
                                                Finish Turn
                                            </Button>
                                        ) : null }

                                        { userType !== "player" && battle.currentRound <= battle.roundCount ? (
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
                                battle = { battle }
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
                            battleId = { battle._id }
                        />
                    </Col>
                    <BattleEndedModal battle = { battle } />
                </Row>
            </div>
        ) : null
    }
}

export default BattleRoom;