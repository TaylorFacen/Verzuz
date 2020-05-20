import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './PlayerLogin.css';
import BattleEnded from '../BattleEnded';
import BattleNotFound from '../BattleNotFound';
import PlayerLoginForm from './PlayerLoginForm';

import { Battle } from '../../services/battle';
import cookieService from '../../services/cookieService';

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

    async componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = cookieService.parseCookie(battleId)

        if ( cookieResp.hasAccess && cookieResp.data.userType === "player" ) {
            // User is already authenticated as a player
            window.location.replace(`/battles/${battleId}`)
        } else {
            window.analytics.page('Player Log In');
            
            const battle = new Battle(battleId);
            await battle.init();
            this.setState({
                battle,
                isLoading: false
            })
        }
    }

    onSubmit(e) {
        const { battle, accessCode } = this.state;
        e.preventDefault();

        const player = battle.players.find(player => player.accessCode.toUpperCase() === accessCode.toUpperCase());
        if ( player ) {
            this.setState({
                errorMessage: null
            })

            cookieService.setCookie(battle.id, player._id, "player")
            .then(() => {
                // Redirect to battle page
                window.location.replace(`/battles/${battle.id}`)
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
                { !battle.isBattle ? <BattleNotFound /> : null }
                { battle.isBattle && !battle.endedOn ? (
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
                ): null }
                { battle.isBattle && !!battle.endedOn ? (
                    <BattleEnded battle = { battle } />
                ) : null }
            </div>
        )
    }
}

export default PlayerLogin;