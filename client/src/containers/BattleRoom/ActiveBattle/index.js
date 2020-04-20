import React, { Component } from 'react';

class ActiveBattle extends Component {
    render(){
        const { battle } = this.props;

        return (
            <div className = "ActiveBattle">
                Battle: { battle.name }
            </div>
        )
    }
}

export default ActiveBattle;