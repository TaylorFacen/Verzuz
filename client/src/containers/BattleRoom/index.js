import React, { Component } from "react";

import './BattleRoom.css';
import ActiveBattle from './ActiveBattle';
import BattleEnded from './BattleEnded';
import BattleNotFound from './BattleNotFound';
import BattleNotStarted from './BattleNotStarted';

import battleService from '../../services/battleService';

class BattleRoom extends Component {
    state = {
        battle: null,
        isLoading: true,
        phoneNumber: ''
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

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    render(){
        const { battle, isLoading, phoneNumber } = this.state;

        return !isLoading ? (
            <div className = "BattleRoom">
                { !battle ? <BattleNotFound /> : null }
                { !!battle & !battle?.startedOn ? (
                    <BattleNotStarted 
                        battle = { battle }
                        phoneNumber = { phoneNumber }
                        onChange = { this.onChange.bind(this) }
                    /> 
                ): null }
                { !!battle & !!battle?.startedOn & !battle?.endedOn ? <ActiveBattle battle = { battle } /> : null }
                { !!battle & !!battle?.startedOn & !!battle?.endedOn ? <BattleEnded /> : null }
            </div>
        ) : null
    }
}

export default BattleRoom;