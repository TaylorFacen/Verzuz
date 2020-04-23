import React, { Component } from "react";

import './BattleRoom.css';
import BattleEnded from './BattleEnded';
import BattleNotFound from './BattleNotFound';

import battleService from '../../services/battleService';
import parseCookie from '../../services/parseCookie';

class BattleRoom extends Component {
    state = {
        battle: null,
        isLoading: true,
        phoneNumber: '',
        userType: '',
        name: ''
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            battleService.getBattle(battleId)
            .then(battle => {
                this.setState({
                    battle,
                    isLoading: false,
                    ...cookieResp.data
                })
            })
            .catch(error => {
                if (error?.response?.status === 404 ) {
                    // Battle not found 
                    this.setState({
                        isLoading: false,
                        ...cookieResp.data
                    })
                } else {
                    console.log(error)
                }
            })

        } else {
            window.location.replace(`/battles/${battleId}/join`)
        }
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
                { !battle ? <BattleNotFound /> : null }
                { !!battle & !!battle?.startedOn & !!battle?.endedOn ? <BattleEnded /> : null }
            </div>
        ) : null
    }
}

export default BattleRoom;