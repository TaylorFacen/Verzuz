import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import axios from 'axios';

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
        roundCount: 5,
        player1Name: '',
        player1Email: '',
        player2Name: '',
        player2Email: '',
        battle: null
    }

    componentDidMount(){
        window.analytics.page('Create Battle');
    }

    submitBattleDetails = async e => {
        const { audienceLimit,  battleName, roundCount, player1Name, player1Email, player2Name, player2Email } = this.state;
        e.preventDefault();

        const data = {
            name: battleName,
            roundCount: roundCount,
            audienceLimit: audienceLimit,
            players: [
                {
                    name: player1Name,
                    email: player1Email                
                },
                {
                    name: player2Name,
                    email: player2Email
                }
            ]
        }

        axios.post(`/api/battles`, data)
        .then(res => {
            const battle = res.data.battle;
            this.setState({
                displayBattleDetails: false,
                displayConfirmationScreen: true,
                battle
            })
        })
    }

    validateBattleDetails = () => {
        const { battleName, player1Name, player1Email, player2Name, player2Email } = this.state;

        return battleName.length > 0 && player1Name.length > 0 && player1Email.length > 0 && player2Name.length > 0 && player2Email.length
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    render(){
        const { displayBattleDetails, displayConfirmationScreen } = this.state;
        const { battleName, roundCount, audienceLimit, player1Name, player1Email, player2Name, player2Email, battle } = this.state;
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
                                player1Email = { player1Email }
                                player1Name = { player1Name }
                                player2Email = { player2Email }
                                player2Name = { player2Name }
                                isValid = { this.validateBattleDetails() }
                            /> 
                        ): null }
                        { displayConfirmationScreen ? (
                            <Confirmation 
                                battleName = { battleName }
                                player1Name = { player1Name }
                                player2Name = { player2Name } 
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