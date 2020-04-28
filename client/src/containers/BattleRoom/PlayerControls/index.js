import React, { Component } from 'react';

import EndBattle from './EndBattle';
import StartBattle from './StartBattle';

class PlayerControls extends Component {
    state = {
        displayStartBattleModal: false,
        displayEndBattleModal: false
    }

    toggleModal = name => {
        this.setState(prevState => ({
            [name]: !prevState[[name]]
        }))
    }

    render(){
        const { startedOn, endedOn, startBattle, endBattle } = this.props;
        const { displayStartBattleModal, displayEndBattleModal } = this.state;
    
        return (
            <div className = "PlayerControls">
                { !startedOn && !endedOn ? (
                    <StartBattle 
                        show = { displayStartBattleModal }
                        toggleModal = { () => this.toggleModal("displayStartBattleModal") }
                        startBattle = { startBattle }
                    />
                ) : null }
                { !!startedOn && !endedOn ? (
                    <EndBattle 
                        show = { displayEndBattleModal }
                        toggleModal = { () => this.toggleModal("displayEndBattleModal") }
                        endBattle = { endBattle }
                    />
                ) : null }
            </div>
        )
    }
}

export default PlayerControls;