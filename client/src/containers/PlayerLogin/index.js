import React, { Component } from 'react';

import './PlayerLogin.css';
import BattleNotFound from '../BattleNotFound';

import battleService from '../../services/battleService';

class PlayerLogin extends Component {
    state = {
        isLoading: true,
        battle: null,
        accessCode: ''
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
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

    render(){
        const { isLoading, battle } = this.state;

        return !isLoading && (
            <div className = "PlayerLogin">
                { !!battle ? (
                    "Login"
                ): <BattleNotFound />}
            </div>
        )
    }
}

export default PlayerLogin;