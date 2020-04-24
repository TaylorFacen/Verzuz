import React, { Component } from "react";
import { Row, Col } from 'react-bootstrap';
import Pusher from 'pusher-js';

import './BattleRoom.css';
import CommentsSection from './CommentsSection';
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
        viewers: 0,
        participants: [],
        currentRound: 1
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)
        const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
            cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
            encrypted: true
        });
        const channel = pusher.subscribe(battleId);

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const { phoneNumber, userType, name, email } = cookieResp.data;

            this.prepareViewer(channel, battleId, phoneNumber || email, userType, name)
            .then(() => {
                // Running prepareViewer first to make sure new ser is added to the database before getting the viewer count

                // Battle subscriptions
                const battleSubPromise = this.startBattleSubscription(channel, battleId);

                // Comment subscriptions
                const commentsSubPromise = this.prepareComments(channel, battleId)

                Promise.all([battleSubPromise, commentsSubPromise])
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

    async startViewerSubscription(channel, phoneNumber){
        // New Viewer
        channel.bind('new-viewer', data => {
            const comment = {
                createdOn: Date.now(),
                text: "joined",
                name: data.viewer.name,
                userId: "system",
                _id: Math.random().toString(36).substr(2, 10).toUpperCase()
            }

            this.setState(prevState => {
                const { comments } = prevState;
                // Makes sure not to include duplicate contacts
                const oldComments = comments.filter(c => c._id !== comment._id)
                oldComments.push(comment);
                return {
                    comments: oldComments,
                    viewers: prevState.viewers + 1
                }
            })
        })

        // Boot User
        channel.bind('boot-viewer', data => {
            if ( phoneNumber === data.phoneNumber ) {
                // Remove all subscriptions

                // Display boot reason (e.g. New session, blocked from battle, battle ended)
            }
        })
    }

    async prepareViewer(channel, battleId, contact, userType, name) {
        this.startViewerSubscription(channel, contact)
        .then(() => {
            if ( userType !== 'player') {
                battleService.addViewer(battleId, contact, userType, name)
                .then(() => {
                    this.setState({
                        name: name,
                        phoneNumber: contact,
                        userType: userType
                    })
                })
                .catch(error => console.log(error.response))
            } else {
                this.setState({
                    name: name,
                    email: contact,
                    userType: userType
                })
            }
        })
        .catch(error => console.log(error))
    }

    async startBattleSubscription(channel, battleId) {
        const battle = await battleService.getBattle(battleId);

        this.setState(prevState => {
            return {
                viewers: battle.viewers,
                battleName: battle.name,
                participants: battle.participants,
                roundCount: battle.roundCount,
                currentRound: battle.currentRound
            }
        })
    }

    async startCommentsSubscription(channel) {
        channel.bind('new-comment', data => {
            const { comment } = data;
            this.setState(prevState => {
                const { comments } = prevState;
                const oldComments = comments.filter(c => c._id !== comment._id)
                oldComments.push(comment)

                return { comments: oldComments }
            })
        })
    }

    async prepareComments(channel, battleId) {
        this.startCommentsSubscription(channel)
        .then(async () => {
            const resp = await battleService.getComments(battleId);
            this.setState(prevState => ({
                comments: prevState.comments.concat(resp.comments)
            }))
        })
        .catch(error => console.log(error))
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    render(){
        const { viewers, comments, battleName, participants, isLoading } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                <h1>{ battleName }</h1>
                <Row className = "battle">
                    <Col xl = {9} lg = {9} md = {9} sm = {12} xs = {12} className = "battle-room-details">
                        <Row className = "participants">
                            { participants.map(p => (
                                <Col key = { p.email } >
                                    <VideoPlayer playerName = { p.name } />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                    <Col xl = {3} lg = {3} md = {3} sm = {12} xs = {12} className = "battle-room-social">
                        <ViewerCount viewerCount = { viewers } />
                        <CommentsSection comments = { comments } />
                    </Col>
                </Row>
            </div>
        ) : null
    }
}

export default BattleRoom;