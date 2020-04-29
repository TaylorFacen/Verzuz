import React, { Component } from "react";
import { Row, Col, Button } from 'react-bootstrap';
import Pusher from 'pusher-js';

import './BattleRoom.css';
import CommentsSection from './CommentsSection';
import CurrentRound from './CurrentRound';
import Navigation from './Navigation';
import PlayerControls from './PlayerControls';
import VideoPlayer from './VideoPlayer';
import ViewerCount from './ViewerCount';

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
        roundCount: null
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const cookieData = cookieResp.data;

            // Set the user
            this.setUser(battleId, cookieData)
            .then(() => {
                // Start subscriptions
                const subscriptionPromise = this.startSubscriptions(battleId, cookieData.phoneNumber || cookieData.email)

                // Get data
                const dataPromise = this.getData(battleId)

                Promise.all([subscriptionPromise, dataPromise])
                .then(() => {
                    this.setState({
                        isLoading: false
                    })
                })
            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    async startSubscriptions(battleId, contact){
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
                currentRound: 1
            })
        })

        // Battle Ended
        channel.bind('end-battle', data => {
            console.log("Battle ended")
        })

        // Next Turn
        channel.bind('next-turn', data => {
            console.log(data)
            this.setState(data)
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
            .then(() => {
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
                        viewers: uniqueViewers
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
                    endedOn: battle.endedOn
                }
            })
        })
    }

    leaveBattle = reason => {
        const { userType, phoneNumber } = this.state;
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

    render(){
        const { battleName, startedOn, endedOn } = this.state;
        const { viewers, comments, participants, currentTurn, currentRound, roundCount } = this.state;
        const { isLoading, name, phoneNumber, email, userType } = this.state;

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
                            />
                        </Row>
                        <Row className = "participants">
                            { participants.map(p => {
                                const isActive = currentTurn === p.email;
                                const displayFinishTurnButton = isActive && email === p.email && currentRound <= roundCount;

                                return (
                                    <Col key = { p.email } >
                                        <VideoPlayer 
                                            playerName = { p.name } 
                                            isActive = { isActive }
                                        />
                                        { displayFinishTurnButton ? (
                                            <Button className = "cta" onClick = { this.finishTurn.bind(this) }>
                                                Finish Turn
                                            </Button>
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