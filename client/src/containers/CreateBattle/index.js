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
        displayConfirmationScreen: false
    }

    submitBattleDetails = e => {
        e.preventDefault();

        this.setState({
            displayBattleDetails: false,
            displayConfirmationScreen: true
        })
    }

    render(){
        const { displayBattleDetails, displayConfirmationScreen } = this.state;
        return (
            <div className = "CreateBattle">
                <Row>
                    <Col lg = { 6 } md = { 6 } sm = { 12 }><Overview /></Col>
                    <Col lg = { 6 } md = { 6 } sm = { 12 }>
                        { displayBattleDetails ? (
                            <BattleDetails 
                                onSubmit = { this.submitBattleDetails.bind(this) }
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