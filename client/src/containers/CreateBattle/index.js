import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import './CreateBattle.css';
import BattleDetails from './BattleDetails';
import Confirmation from './Confirmation';
import Overview from './Overview';

class CreateBattle extends Component {
    state = {
        audienceLimit: 10,
        displayBattleDetails: true,
        displayConfirmationScreen: false,
        battleName: '',
        rounds: 5,
        participant1Name: '',
        participant1Email: '',
        participant2Name: '',
        participant2Email: ''
    }

    submitBattleDetails = e => {
        e.preventDefault();
        console.log(this.state)

        this.setState({
            displayBattleDetails: false,
            displayConfirmationScreen: true
        })
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
        const { battleName, rounds, audienceLimit, participant1Name, participant1Email, participant2Name, participant2Email } = this.state;
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
                                rounds = { rounds }
                                audienceLimit = { audienceLimit }
                                participant1Email = { participant1Email }
                                participant1Name = { participant1Name }
                                participant2Email = { participant2Email }
                                participant2Name = { participant2Name }
                                isValid = { this.validateBattleDetails() }
                            /> 
                        ): null }
                        { displayConfirmationScreen ? <Confirmation /> : null }
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CreateBattle;