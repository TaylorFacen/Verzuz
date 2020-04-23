import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './ViewerLogin.css';
import PhoneNumberForm from './PhoneNumberForm';
import VerificationCodeForm from './VerificationCodeForm';
import DisplayNameForm from './DisplayNameForm';
import BattleNotFound from '../BattleNotFound';

import battleService from '../../services/battleService';
import parseCookie from '../../services/parseCookie';

const Earbuds = require('../../images/earbuds.png')

class ViewerLogin extends Component {
    state = {
        displayPhoneNumberForm: true,
        displayVerificationCodeForm: false,
        displayNameForm: false,
        isBlocked: false,
        name: '',
        phoneNumber: '',
        verificationCode: '',
        isLoading: true,
        battle: null
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        if ( cookieResp.hasAccess ) {
            // User is already authenticated
            window.location.replace(`/battles/${battleId}`)
        } else {
            battleService.getBattle(battleId)
            .then(battle => {
                this.setState({
                    isLoading: false,
                    battle
                })
            })
            .catch(error => {
                if (error?.response?.status === 404 ) {
                    // Battle not found
                    this.setState({
                        isLoading: false
                    })
                }
            })
        }
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    onSubmitPhoneNumber = e => {
        e.preventDefault();
        const { battle, phoneNumber } = this.state;
        // Check to see if viewer is blocked
        const blacklist = battle.blacklist;
        if ( blacklist.includes(phoneNumber) ) {
            this.setState({
                displayPhoneNumberForm: false,
                displayVerificationCodeForm: false,
                displayNameForm: false,
                isBlocked: true
            })
        } else {
            // Todo: Send out verification via Twilio Verify

            this.setState({
                displayPhoneNumberForm: false,
                displayVerificationCodeForm: true,
                displayNameForm: false
            })
        }
    }

    onSubmitVerificationCode = e => {
        e.preventDefault();
        // Todo: Check to see if code is correct via Twilio Verify

        this.setState({
            displayPhoneNumberForm: false,
            displayVerificationCodeForm: false,
            displayNameForm: true
        })
    }

    setCookie(battleId, userType, name, phoneNumber) {
        return new Promise((resolve, reject) => {
            let expirationDate = new Date(Date.now() + 86400e3).toUTCString();
            const cookieData = JSON.stringify({
                userType: userType,
                name: name,
                battleId: battleId,
                phoneNumber: phoneNumber
            })
            const uriEncodedCookieData = encodeURI(cookieData)
            document.cookie = `verzuz=${uriEncodedCookieData}; expires=` + expirationDate;
        
            resolve(true)
        })
    }

    onSubmitDisplayName = e => {
        e.preventDefault();
        const { battle, phoneNumber, name } = this.state;

        // Todo: Check to see if user in chat already has display name
        
        // Set cookie
        this.setCookie(battle._id, "viewer", name, phoneNumber)
        .then(() => {
            // Redirect to battle page
            window.location.replace(`/battles/${battle._id}`)
        })
    }

    onCreateSubscription = e => {
        e.preventDefault();

        const { battle } = this.props;
        const { phoneNumber } = this.state;

        battleService.addSubscriber(battle._id, phoneNumber )
        .then(() => {
            this.setState({
                displayPhoneNumberForm: false
            })
        })
        .catch(error => console.log(error))
    }

    renderLoginScreens(){
        const { 
            displayPhoneNumberForm, displayVerificationCodeForm, displayNameForm, isBlocked,
            phoneNumber, verificationCode, name, battle
        } = this.state;
        return (
            <div className = "login-screens">
                { isBlocked ? <h3>You were blocked from joining the { battle.name } battle</h3> : <h3>You are joining the { battle.name } battle.</h3> }
                { displayPhoneNumberForm ? (
                    <div>
                        <p>We will need to send you a one time passocde via sms.</p>
                        <PhoneNumberForm 
                            onChange = { this.onChange.bind(this) }
                            onSubmit = { this.onSubmitPhoneNumber.bind(this) }
                            phoneNumber = { phoneNumber }
                        /> 
                    </div>
                ) : null }
                { displayVerificationCodeForm ? (
                    <VerificationCodeForm 
                        onChange = { this.onChange.bind(this) }
                        onSubmit = { this.onSubmitVerificationCode.bind(this) }
                        verificationCode = { verificationCode }
                    /> 
                ) : null }
                { displayNameForm ? (
                    <DisplayNameForm 
                        onChange = { this.onChange.bind(this) }
                        onSubmit = { this.onSubmitDisplayName.bind(this) }
                        name = { name }
                    /> 
                ) : null }
            </div>
        )
    }

    renderSubscriptionScreens(){
        const { displayPhoneNumberForm, phoneNumber, battle } = this.state;

        return (
            <div className = "subscription-screen">
                <h3>{ battle.name } hasn't started yet.</h3>
                { displayPhoneNumberForm ? (
                    <div>
                        <p>Enter your phone number below to get notified when it begins.</p>
                        <PhoneNumberForm 
                            onChange = { this.onChange.bind(this) }
                            onSubmit = { this.onSubmitPhoneNumber.bind(this) }
                            phoneNumber = { phoneNumber }
                        />
                    </div>
                ) : (
                    <div className = "Confirmation">
                        You'll get a text on { phoneNumber } when the battle starts!
                    </div>
                )}
            </div>
        )
    }

    render(){
        const {isLoading, battle} = this.state;

        return !isLoading && (
            <div className = "ViewerLogin">
                { !battle ? <BattleNotFound /> : (
                    <div className = "module">
                        <Image src = { Earbuds } alt = "Earbuds" className = "hero" />
                        { battle.startedOn ? this.renderLoginScreens() : this.renderSubscriptionScreens() }
                        <p><a href = "/">Home</a></p>
                    </div>
                ) }
            </div>
        )
    }
}

export default ViewerLogin;