import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import './CreateBattle.css';
import BattleDetails from './BattleDetails';
import Confirmation from './Confirmation';
import Overview from './Overview';

import battleService from '../../services/battleService';

class CreateBattle extends Component {
    state = {
        audienceLimit: 10,
        displayBattleDetails: true,
        displayConfirmationScreen: false,
        battleName: '',
        roundCount: 5,
        participant1Name: '',
        participant1Email: '',
        participant2Name: '',
        participant2Email: '',
        battle: null
    }

    submitBattleDetails = e => {
        const { audienceLimit,  battleName, roundCount, participant1Name, participant1Email, participant2Name, participant2Email } = this.state;
        e.preventDefault();

        const data = {
            name: battleName,
            roundCount: roundCount,
            audienceLimit: audienceLimit,
            participants: [
                {
                    name: participant1Name,
                    email: participant1Email,
                    accessCode: Math.random().toString(36).substr(2, 6).toUpperCase()
                },
                {
                    name: participant2Name,
                    email: participant2Email,
                    accessCode: Math.random().toString(36).substr(2, 6).toUpperCase()
                }
            ]
        }

        battleService.createBattle(data)
        .then(response => {
            this.setState({
                displayBattleDetails: false,
                displayConfirmationScreen: true,
                battle: response.battle
            })
        })
        .catch(error => console.log(error))
    }

    validateBattleDetails = () => {
        const { battleName, participant1Name, participant1Email, participant2Name, participant2Email } = this.state;

        return battleName.length > 0 && participant1Name.length > 0 && participant1Email.length > 0 && participant2Name.length > 0 && participant2Email.length
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    render(){
        const { displayBattleDetails, displayConfirmationScreen } = this.state;
        const { battleName, roundCount, audienceLimit, participant1Name, participant1Email, participant2Name, participant2Email, battle } = this.state;
        return (
            <div className = "CreateBattle">
                <Row>
                    <Col lg = { 6 } md = { 6 } sm = { 12 } xs = { 12 } className = "overview-col"><Overview /></Col>
                    <Col lg = { 6 } md = { 6 } sm = { 12 } xs = { 12 } className = "form-col">
                        { displayBattleDetails ? (
                            <BattleDetails 
                                onSubmit = { this.submitBattleDetails.bind(this) }
                                onChange = { this.onChange.bind(this) }
                                battleName = { battleName }
                                roundCount = { roundCount }
                                audienceLimit = { audienceLimit }
                                participant1Email = { participant1Email }
                                participant1Name = { participant1Name }
                                participant2Email = { participant2Email }
                                participant2Name = { participant2Name }
                                isValid = { this.validateBattleDetails() }
                            /> 
                        ): null }
                        { displayConfirmationScreen ? (
                            <Confirmation 
                                battleName = { battleName }
                                participant1Name = { participant1Name }
                                participant2Name = { participant2Name } 
                                battleId = { battle?._id }
                                roundCount = { roundCount }
                                audienceLimit = { audienceLimit }
                            /> 
                        ): null }
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CreateBattle;