import React, { Component } from 'react';

import './PlayerControls.css';
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

    startBattle(){
        this.props.startBattle()
        .then(() => {
            this.setState({
                displayStartBattleModal: false
            })
        })
        .catch(error => console.log(error))
    }

    endBattle(){
        this.props.endBattle()
        .then(() => {
            this.setState({
                displayEndBattleModal: false
            })
        })
        .catch(error => console.log(error))
    }

    render(){
        const { startedOn, endedOn } = this.props;
        const { displayStartBattleModal, displayEndBattleModal } = this.state;
    
        return (
            <div className = "PlayerControls">
                { !startedOn && !endedOn ? (
                    <StartBattle 
                        show = { displayStartBattleModal }
                        toggleModal = { () => this.toggleModal("displayStartBattleModal") }
                        startBattle = { this.startBattle.bind(this) }
                    />
                ) : null }
                { !!startedOn && !endedOn ? (
                    <EndBattle 
                        show = { displayEndBattleModal }
                        toggleModal = { () => this.toggleModal("displayEndBattleModal") }
                        endBattle = { this.endBattle.bind(this) }
                    />
                ) : null }
            </div>
        )
    }
}

export default PlayerControls;