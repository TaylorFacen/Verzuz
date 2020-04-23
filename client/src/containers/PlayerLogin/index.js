import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './PlayerLogin.css';
import BattleNotFound from '../BattleNotFound';
import PlayerLoginForm from './PlayerLoginForm';

import battleService from '../../services/battleService';
import parseCookie from '../../services/parseCookie';

const Play = require('../../images/play.png')

class PlayerLogin extends Component {
    state = {
        isLoading: true,
        battle: null,
        accessCode: '',
        errorMessage: null
    }

    onChange = e => {
        const { value } = e.target;
        
        this.setState({
            accessCode : value
        })
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        if ( cookieResp.hasAccess && cookieResp.data.userType === "player" ) {
            // User is already authenticated as a player
            window.location.replace(`/battles/${battleId}`)
        } else {
            battleService.getBattle(battleId)
            .then(battle => {
                this.setState({
                    battle,
                    isLoading: false
                })
            })
            .catch(error => {
                if (error?.response?.status === 404 ) {
                    // Battle not found 
                    this.setState({
                        isLoading: false
                    })
                } else {
                    console.log(error)
                }
            })
        }
    }

    setCookie(battleId, userType, name) {
        return new Promise((resolve, reject) => {
            let expirationDate = new Date(Date.now() + 86400e3).toUTCString();
            const cookieData = JSON.stringify({
                userType: userType,
                name: name,
                battleId: battleId
            })
            const uriEncodedCookieData = encodeURI(cookieData)
            document.cookie = `verzuz=${uriEncodedCookieData}; expires=` + expirationDate;
        
            resolve(true)
        })
    }

    onSubmit(e) {
        const { battle, accessCode } = this.state;
        e.preventDefault();

        const participantQuery = battle.participants.filter(p => p.accessCode.toUpperCase() === accessCode.toUpperCase())
        if ( participantQuery.length === 1 ) {
            const participant = participantQuery[0]
            this.setState({
                errorMessage: null
            })

            // Set cookie
            this.setCookie(battle._id, "player", participant.name)
            .then(() => {
                // Redirect to battle page
                window.location.replace(`/battles/${battle._id}`)
            })

            
        } else {
            this.setState({
                errorMessage: "Your access code is incorrect. Please try again."
            })
        }
    }

    render(){
        const { isLoading, battle, accessCode, errorMessage } = this.state;

        return !isLoading && (
            <div className = "PlayerLogin">
                { !!battle ? (
                    <div className = "module">
                        <Image src = { Play } alt = "Play" className = "hero" />
                        <h3>You are joining the { battle.name } battle.</h3>
                        { errorMessage ? <p className = "error-message">{ errorMessage }</p> : null }
                        <PlayerLoginForm 
                            onChange = { this.onChange.bind(this) }
                            accessCode = { accessCode }
                            onSubmit = { this.onSubmit.bind(this) }
                        />
                        <p><a href = "/">Home</a></p>
                    </div>
                ): <BattleNotFound />}
            </div>
        )
    }
}

export default PlayerLogin;