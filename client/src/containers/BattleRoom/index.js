import React, { Component } from "react";

import battleService from '../../services/battleService';

class BattleRoom extends Component {
    state = {
        battle: null
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();

        battleService.getBattle(battleId)
        .then(battle => {
            this.setState({
                battle
            })
        })
        .catch(error => console.log(error))


    }

    render(){
        const { battle } = this.state;
        return battle && (
            <div className = "BattleRoom">
                Battle: {battle.name}
            </div>
        )
    }
}

export default BattleRoom;