import React, { Component } from "react";

import './ActiveBattle.css';
import ActiveBattle from './ActiveBattle';
import BattleEnded from './BattleEnded';
import BattleNotFound from './BattleNotFound';
import BattleNotStarted from './BattleNotStarted';

import battleService from '../../services/battleService';

class BattleRoom extends Component {
    state = {
        battle: null,
        isLoading: true
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
        const { battle, isLoading } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                { !battle ? <BattleNotFound /> : null }
                { !!battle & !battle?.startedOn ? <BattleNotStarted /> : null }
                { !!battle & !!battle?.startedOn & !battle?.endedOn ? <ActiveBattle battle = { battle } /> : null }
                { !!battle & !!battle?.startedOn & !!battle?.endedOn ? <BattleEnded /> : null }
            </div>
        ) : null
    }
}

export default BattleRoom;