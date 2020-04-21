import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import './CreateBattle.css';
import BattleDetails from './BattleDetails';
import Confirmation from './Confirmation';
import Overview from './Overview';
import Payment from './Payment'

class CreateBattle extends Component {
    state = {
        audienceLimit: 10,
        displayBattleDetails: true,
        displayPaymentScreen: false,
        displayConfirmationScreen: false
    }

    submitBattleDetails = e => {
        const { audienceLimit } = this.state;
        e.preventDefault();

        if ( audienceLimit === 10 ) {
            this.setState({
                displayBattleDetails: false,
                displayConfirmationScreen: true
            })
        } else {
            this.setState({
                displayBattleDetails: false,
                displayPaymentScreen: true
            })
        }
    }

    goBackToBattleDetails = () => {
        this.setState({
            displayBattleDetails: true,
            displayPaymentScreen: false
        })
    }

    submitPaymentDetails = e => {
        e.preventDefault();
        this.setState({
            displayPaymentScreen: false,
            displayConfirmationScreen: true
        })
    }

    render(){
        const { displayBattleDetails, displayPaymentScreen, displayConfirmationScreen } = this.state;
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
                        { displayPaymentScreen ? (
                            <Payment 
                                goBackToBattleDetails = { this.goBackToBattleDetails.bind(this) }
                                onSubmit = { this.submitPaymentDetails.bind(this) }
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