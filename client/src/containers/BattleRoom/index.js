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
import { Battle, User } from '../../services/battle';
import cookieService from '../../services/cookieService';
import PusherClient from '../../services/pusher';


class BattleRoom extends Component {
    state = {
        isLoading: true,
        // Putting currentVote directly in state because changes to the user object doesn't always render immediately
        currentVote: null
    }

    async componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = cookieService.parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const cookieData = cookieResp.data;
            const { userId, userType } = cookieData;

            // Get battle
            const battle = new Battle(battleId);
            await battle.init();

            // Get user
            const user = new User(battleId, userId, userType);
            await user.init();

            // Start pusher subscriptions
            const pusher = this.startPusherSubscription(battleId, user.phoneNumber || user.email);

            // Start Agora subscription
            const agora = this.startMediaSubscription(battle.name, user.userType, user.id )

            this.setState({
                battle,
                user,
                pusher,
                agora,
                currentVote: user.getCurrentVote(battle.currentRound),
                isLoading: false
            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    startPusherSubscription(battleId, user){
        const pusher = new PusherClient();
        pusher.subscribeToChannel(battleId);

        // Pusher Events
        pusher.subscribeToNewViewerEvent(async viewer => {
            this.setState(async prevState => {
                const { battle } = prevState;
                await battle.addViewer(viewer);
                return { battle }
            })
        })

        pusher.subscribeToBootViewerEvent((userId, reason) => {
            if ( user.id === userId ) {
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
                this.setState(async prevState => {
                    const { battle } = prevState;
                    await battle.removeViewer(userId)
                    return { battle }
                })
            }
        })

        pusher.subscribeToNewCommentEvent(comment => {
            this.setState(async prevState => {
                const { battle } = prevState;

                battle.addComment(comment);
                return { battle }
            })
        })

        pusher.subscribeToBattleStartedEvent(currentTurn => {
            this.setState(async prevState => {
                const { battle } = prevState;
                battle.currentTurn = currentTurn;
                battle.currentRound = 1;
                battle.startedOn = Date.now()

                return { battle }
            })
        })

        pusher.subscribeToBattleEndedEvent(async votes => {
            const { agora, pusher, battle } = this.state;

            // Unsubscribe from channels
            agora.leaveChannel();
            pusher.unsubscribeFromChannel(battle.id);
            cookieService.removeCookie();

            this.setState( prevState => {
                const { battle } = prevState;

                battle.endedOn = Date.now();
                battle.votes = votes

                return { battle }
            })
        })

        pusher.subscribeToNextTurnEvent((currentRound, currentTurn, previousTurn, votes) => {
            this.setState( prevState => {
                const { battle } = prevState;

                battle.currentRound = currentRound;
                battle.currentTurn = currentTurn;
                battle.previousTurn = previousTurn;
                battle.votes = votes

                return { battle }
            })
        })

        return pusher
    }

    async startMediaSubscription(battleName, userType, userId){
        const updatePlayersCallback = (playerId, isStreaming, isAudioConnected) => {
            this.setState(prevState => {
                const { battle } = prevState;
                const { players } = battle;

                const player = players.find(p => p._id === playerId);
                const updatedPlayer = {
                    ...player,
                    isStreaming,
                    isAudioConnected
                }

                battle.players = players.filter(p => p._id !== playerId).concat([updatedPlayer])

                return { battle }
            })
        }

        const agora = new AgoraClient();
        agora.joinChannel(userType, battleName, userId, updatePlayersCallback)
        
        return agora
    }

    async leaveBattle() {
        const { user, pusher, agora, battle } = this.state;
        const battleId = battle.id;

        // Unsubscribe from Pusher
        pusher.unsubscribeFromChannel(battleId);

        // Unsubscribe from Agora
        agora.leaveChannel();

        // If not a player, "delete" viewer from battle's viewers list
        if ( user.type !== 'player') {
            await battle.leaveBattle(user.id )
        }

        // Remove cookie
        cookieService.removeCookie()
        .then(() => window.location.replace(`/`))
    }

    async startBattle(){
        const { battle } = this.state;
        await battle.start();
        this.setState({ battle })
    }

    async endBattle(){
        this.setState(async prevState => {
            const { battle } = prevState;
            await battle.end();
            return { battle }
        })
    }

    finishTurn(){
        this.setState(async prevState => {
            const { battle } = prevState;
            await battle.nextTurn();
            return { battle }
        })
    }

    castVote = async playerId => {
        const { user, battle } = this.state;
        await user.vote(battle.currentRound, playerId);
        this.setState({ user, currentVote: playerId })
    }

    // User has to manually toggle audio due to Chrome / Safari rules
    toggleAudio = playerId => {
        const playerAudio = document.getElementById(`audio${playerId}`);
        
        playerAudio.paused ? playerAudio.play() : playerAudio.pause()

        this.setState(prevState => {
            const { battle } = prevState;
            const { players } = battle
            const player = players.find(p => p._id === playerId);
            const updatedPlayer = {
                ...player,
                isAudioConnected: !player.isAudioConnected
            }
            battle.players = players.filter(p => p._id !== playerId).concat([updatedPlayer])

            return { battle }
        })
    }

    render(){
        const { battle, user, isLoading, currentVote } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                <Navigation 
                    battle = { battle }
                    leaveBattle = { this.leaveBattle.bind(this) }
                />
                <Row className = "battle">
                    <Col xl = {9} lg = {9} md = {9} sm = {12} xs = {12} className = "battle-room-details">
                        <Row className = "round">
                            <CurrentRound battle = { battle } />
                        </Row>
                        <Row className = "players">
                            { battle.players.sort((a, b) => a.name > b.name ? 1 : -1).map(p => {
                                const isActive = battle.currentTurn === p._id && ( battle.currentRound <= battle.roundCount );
                                const isCurrentVote = currentVote === p._id;
                                const displayFinishTurnButton = isActive && user.id === p._id && battle.currentRound <= battle.roundCount;
                                const score = battle.playerScores.find(s => s.player._id === p._id)?.score
                                return (
                                    <Col key = { p._id } >
                                        <VideoPlayer 
                                            player = { p }
                                            isActive = { isActive }
                                            videoPlayerId = { p._id === user.id ? "local_stream" : `remote_video_${p._id}` }
                                            toggleAudio = { () => this.toggleAudio(p._id) }
                                        />
                                        <PlayerScore score = { score } />

                                        { displayFinishTurnButton ? (
                                            <Button className = "cta" onClick = { this.finishTurn.bind(this) }>
                                                Finish Turn
                                            </Button>
                                        ) : null }

                                        { user.userType !== "player" && battle.currentRound <= battle.roundCount ? (
                                            <VoteButton 
                                                isCurrentVote = { isCurrentVote }
                                                castVote = {() => this.castVote(p._id) }
                                            />
                                        ) : null }
                                    </Col>
                                )
                            })}
                        </Row>
                        { user.userType === 'player' ? (
                            <PlayerControls 
                                battle = { battle }
                                startBattle = { this.startBattle.bind(this) }
                                endBattle = { this.endBattle.bind(this) }
                            />
                        ) : null}
                    </Col>
                    <Col xl = {3} lg = {3} md = {3} sm = {12} xs = {12} className = "battle-room-social">
                        <ViewerCount viewerCount = { battle.viewerCount } />
                        <CommentsSection 
                            battle = { battle }
                            user = { user }
                        />
                    </Col>
                    <BattleEndedModal battle = { battle } />
                </Row>
            </div>
        ) : null
    }
}

export default BattleRoom;