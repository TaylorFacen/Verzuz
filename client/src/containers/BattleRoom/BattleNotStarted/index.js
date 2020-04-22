import React, { Component } from 'react'
import { Image } from 'react-bootstrap';

import Confirmation from './Confirmation';
import PhoneNumberForm from './PhoneNumberForm';

import battleService from '../../../services/battleService';

const Headphone = require('../../../images/headphone.png')

class BattleNotStarted extends Component {
    state = {
        phoneNumber: '',
        displayPhoneNumberForm: true
    }

    onChange = e => {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSubmit = e => {
        const { battle } = this.props;
        const { phoneNumber } = this.state;

        e.preventDefault();

        battleService.addSubscriber(battle._id, phoneNumber )
        .then(() => {
            this.setState({
                displayPhoneNumberForm: false
            })
        })
        .catch(error => console.log(error))
    }

    render(){
        const { phoneNumber, displayPhoneNumberForm } = this.state;
        const { battle } = this.props;
        return (
            <div className = "BattleNotStarted module">
                <Image src = { Headphone } className = "hero" alt = "Headphone" />
                <h3>{ battle.name } hasn't started yet.</h3>
                { displayPhoneNumberForm ? (
                    <PhoneNumberForm 
                        phoneNumber = { phoneNumber }
                        onSubmit = { this.onSubmit.bind(this) }
                        onChange = { this.onChange.bind(this) }
                    />
                ) : <Confirmation phoneNumber = { phoneNumber } /> }
                <p><a href = "/">Home</a></p>
            </div>
        )
    }
}

export default BattleNotStarted;