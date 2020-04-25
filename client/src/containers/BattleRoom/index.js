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

                const allViewers = viewers.filter(v => v.phoneNumber !== contact)
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

                // Display boot reason (e.g. New session, blocked from battle, battle ended)
            }
        })

        // New Comment
        channel.bind('new-comment', data => {
            const { comment } = data;
            this.setState(prevState => {
                const { comments } = prevState;
                const allComments = comments.filter(c => c._id !== comment._id)
                allComments.push(comment)

                return { comments: allComments }
            })
        })
    }

    async setUser(battleId, cookieData) {
        const { userType, name, email, phoneNumber } = cookieData

        if (userType === 'player') {
            this.setState({
                name: name,
                email: email,
                userType: userType,
            })
        } else {
            battleService.addViewer(battleId, phoneNumber, userType, name)
            .then(() => {
                this.setState({
                    name: name,
                    phoneNumber: phoneNumber,
                    userType: userType
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
                const allViewers = prevState.viewers;
                allViewers.push(viewers)
                const uniqueViewers = Array.from(new Set(allViewers.map(v => v.phoneNumber)))
                .map(phoneNumber => allViewers.find(v => v.phoneNumber === phoneNumber))

                const allComments = prevState.comments;
                allComments.push(comments);
                const uniqueComments = Array.from(new Set(allComments.map(c => c._id)))
                .map(id => allComments.find(c => c._id === id))

                return {
                    viewers: uniqueViewers,
                    battleName: battle.name,
                    participants: battle.participants,
                    roundCount: battle.roundCount,
                    currentRound: battle.currentRound,
                    comments: uniqueComments
                }
            })
        })
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