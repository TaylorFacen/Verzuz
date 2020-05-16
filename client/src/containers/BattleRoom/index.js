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
        user: null,
        isLoading: true
    }

    async componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = cookieService.parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const cookieData = cookieResp.data;

            // Get data
            this.setBattle(battleId)
            .then(() => {
                // Set the user
                this.setUser(cookieData)
                .then(user => {
                    // Start pusher subscriptions
                    this.startPusherSubscription(battleId, user.phoneNumber || user.email)
                    .then(() => {
                        this.startMediaSubscription(user.userType, user.email || user.phoneNumber)
                    })
                })
            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    async setUser(cookieData) {
        const { userId, userType, battleId } = cookieData;

        const user = new User(battleId, userId, userType);

        this.setState(async prevState => {
            const { battle } = prevState;
            battle.newViewer = user;

            return {
                user,
                battle
            }
        })

        return user
    }

    setBattle( battleId ){
        const battle = new Battle(battleId);
        this.setState({ battle, isLoading: false })
    }

    async startPusherSubscription(battleId, user){
        const pusher = new PusherClient();
        pusher.subscribeToChannel(battleId);

        // Pusher Events
        pusher.subscribeToNewViewerEvent(async viewer => {
            this.setState(async prevState => {
                const { battle } = prevState;
                battle.newViewer = viewer;
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

                battle.newComment = comment;
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

        this.setState({
            pusher
        })
    }

    async startMediaSubscription(userType, uid){
        const { battle } = this.state;

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
        agora.joinChannel(userType, battle.name, uid, updatePlayersCallback)
        this.setState({
            agora
        })
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
        this.setState(async prevState => {
            const { battle } = prevState;
            await battle.start();
            return { battle }
        })
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

    castVote = playerId => {
        this.setState(prevState => {
            const { battle, user } = prevState;
            const updatedUser = battle.vote(playerId, battle.currentRound, user);
            return { user: updatedUser }
        })
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
        const { battle, user, isLoading } = this.state;

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
                            { battle.players.map(p => {
                                const isActive = battle.currentTurn === p._id && ( battle.currentRound <= battle.roundCount );
                                const isCurrentVote = !!user.votes && user.votes.find(v => v.round === (battle.currentRound > battle.roundCount ? battle.currentRound - 1 : battle.currentRound)).playerId === p._id;
                                const displayFinishTurnButton = isActive && user.id === p._id && battle.currentRound <= battle.roundCount;
                                const score = battle.playerScores.filter(s => s.player._id = p._id);

                                return (
                                    <Col key = { p.email } >
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
                        <ViewerCount viewers = { battle.viewerCount } />
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