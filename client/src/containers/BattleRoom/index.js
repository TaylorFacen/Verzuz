import React, { Component } from 'react';

class BattleRoom extends Component {
    render(){
        return (
            <div className = "BattleRoom">
                Battle: {this.props.match.params.battleId}
            </div>
        )
    }
}

export default BattleRoom;