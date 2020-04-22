import React, { Component } from 'react'
import { Image } from 'react-bootstrap';

import Confirmation from './Confirmation';
import PhoneNumberForm from './PhoneNumberForm';

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
        e.preventDefault();
        console.log(this.state)
    }

    render(){
        const { phoneNumber, displayPhoneNumberForm } = this.state;
        const { battle } = this.props;
        return (
            <div className = "BattleNotStarted module">
                <Image src = { Headphone } className = "hero" alt = "Headphone" />
                <h3>{ battle.name } hasn't started yet.</h3>
                <p>Enter your phone number below to get notified when it begins.</p>
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