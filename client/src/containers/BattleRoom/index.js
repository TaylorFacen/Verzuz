import React, { Component } from "react";
import Pusher from 'pusher-js';

import './BattleRoom.css';
import BattleEnded from './BattleEnded';

import battleService from '../../services/battleService';
import parseCookie from '../../services/parseCookie';

class BattleRoom extends Component {
    state = {
        battle: null,
        isLoading: true,
        phoneNumber: '',
        userType: '',
        name: '',
        comments: [],
        viewers: 0,
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)
        const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
            cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
            encrypted: true
        });
        const channel = pusher.subscribe(roomId);

        if ( cookieResp.hasAccess ) {
            // Viewer subscriptions
            const viewerSubPromise = startViewerSubscription(channel, battleId, cookieResp.phoneNumber, cookieResp.userType, cookieResp.name);

            // Battle subscriptions
            const battleSubPromise = startBattleSubscription(channel, battleId);

            // Comment subscriptions
            const commentsSubPromise = startCommentsSubscription(channel, battleId)

            Promise.all([viewerSubPromise, battleSubPromise, commentsSubPromise])
            .then(() => {
                this.setState({
                    isLoading: false
                })
            })
        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
    }

    async startViewerSubscription(channel, battleId, phoneNumber, userType, name){
        if ( userType !== 'player') {
            battleService.addViewer(battleId, phoneNumber, userType, name)
        }

        this.setState({
            name: name,
            phoneNumber: phoneNumber,
            userType: userType
        })

        // New Viewer
        channel.bind('new-viewer', data => {
            this.setState(prevState => {
                const { comments } = prevState;
                comments.push({
                    timestamp: data.viewer.joinedOn,
                    comment: "joined",
                    "userName": "system",
                    "userName": "system"
                });

                return {
                    comments,
                    viewers: prevState.viewers + 1
                };
            });
        })

        // Boot Viewer
        channel.bind('boot-viewer', data => {
            if ( phoneNumber === data.phoneNumber ) {
                // Remove all subscriptions

                // Display boot reason (e.g. New session, blocked from battle, battle ended)
            }
        })
    }

    async startBattleSubscription(channel, battleId) {
        const battle = await battleService.getBattle(battleId);

        this.setState(prevState => ({
            viewers: prevState.viewers + battle.viewers,
            battleName: battle.name,
            participants: battle.participants,
            roundCount: battle.roundCount
        }))
    }

    async startCommentsSubscription(channel, battleId) {
        channel.bind('new-comment', data => {
            this.setState(prevState => {
                const { comments } = prevState;
                comments.push(data.comment);

                return {
                    comments
                };
            });
        });

        const comments = await battleService.getComments(battleId);

        this.setState(prevState => ({
            comments: prevState.comments.concat(comments)
        }))
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    render(){
        const { battle, isLoading } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                { !!battle & !!battle?.startedOn & !!battle?.endedOn ? <BattleEnded /> : null }
            </div>
        ) : null
    }
}

export default BattleRoom;