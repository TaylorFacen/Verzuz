import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './ViewerLogin.css';
import PhoneNumberForm from './PhoneNumberForm';
import VerificationCodeForm from './VerificationCodeForm';
import DisplayNameForm from './DisplayNameForm';
import BattleEnded from '../BattleEnded';
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
        isFull: false,
        name: '',
        phoneNumber: '',
        verificationCode: '',
        isLoading: true,
        battle: null,
        errorMessage: null
    }

    componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = parseCookie(battleId)

        battleService.getBattle(battleId)
        .then(battle => {
            if ( !!battle.startedOn && !battle.endedOn && cookieResp.hasAccess ) {
                // User is already authenticated
                window.location.replace(`/battles/${battleId}`)
            } else {
                this.setState({
                    isLoading: false,
                    battle
                })
            }
        })
        .catch(error => {
            // Battle not found
            this.setState({
                isLoading: false
            })
        })
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    onPhoneNumberChange = phoneNumber => {
        this.setState({
            phoneNumber
        })
    }

    canEnterBattle(battle, phoneNumber){
        return new Promise((resolve, reject) => {
            // Check to see if battle is full
            if ( battle.audienceLimit === battle.viewers ) {
                // If user is in battle from another client, allow the user in
                battleService.getViewers(battle._id)
                .then(resp => {
                    const { viewers } = resp;

                    if ( viewers.filter(v => v.phoneNumber === phoneNumber).length === 0) {
                        this.setState({
                            displayPhoneNumberForm: false,
                            displayVerificationCodeForm: false,
                            displayNameForm: false,
                            isFull: true
                        })
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                })
                .catch(error => {
                    console.log(error);
                    reject('error')
                })
            // Check to see if user is on blacklist
            } else if ( battle.blacklist.includes(phoneNumber) ) {
                this.setState({
                    displayPhoneNumberForm: false,
                    displayVerificationCodeForm: false,
                    displayNameForm: false,
                    isBlocked: true
                })
                resolve(false)
            } else {
                resolve(true)
            }
        })
    }

    onSubmitPhoneNumber = e => {
        e.preventDefault();
        const { battle, phoneNumber } = this.state;
        // Check to see if user can eneter
        this.canEnterBattle(battle, phoneNumber)
        .then(canEnter => {
            if ( canEnter ) {
                // Todo: Send out verification via Twilio Verify
                battleService.getVerificationCode(phoneNumber)
                .then(resp => {
                    this.setState({
                        displayPhoneNumberForm: false,
                        displayVerificationCodeForm: true,
                        displayNameForm: false
                    })
                })
            }
        })
    }

    onSubmitVerificationCode = e => {
        e.preventDefault();
        const { verificationCode, phoneNumber } = this.state;
        // Todo: Check to see if code is correct via Twilio Verify
        battleService.checkVerificationCode(phoneNumber, verificationCode)
        .then(status => {
            if (status === 'approved') {
                this.setState({
                    displayPhoneNumberForm: false,
                    displayVerificationCodeForm: false,
                    displayNameForm: true,
                    errorMessage: null
                })
            } else {
                this.setState({
                    errorMessage: "Code is incorrect. Please try again."
                })
            }
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
            document.cookie = `verzuz=${uriEncodedCookieData}; expires=${expirationDate}; path=/;`;
        
            resolve(true)
        })
    }

    onSubmitDisplayName = e => {
        e.preventDefault();
        const { battle, phoneNumber, name } = this.state;

        // Check to see if user in chat already has display name
        battleService.getViewers(battle._id)
        .then(resp => {
            const { viewers } = resp;

            const viewerWithName = viewers.filter(viewer => viewer.name === name)

            if ( viewerWithName.length > 0 && viewerWithName[0].phoneNumber !== phoneNumber ) {
                this.setState({
                    errorMessage: "That name is already taken."
                })
            } else {
                // Set cookie
                this.setCookie(battle._id, "viewer", name, phoneNumber)
                .then(() => {
                    // Redirect to battle page
                    window.location.replace(`/battles/${battle._id}`)
                })
            }
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

    renderHeaderText(){
        const { isBlocked, isFull, battle } = this.state;

        if ( isBlocked ) {
            return <h3>You were blocked from joining the { battle.name } battle</h3> 
        } else if ( isFull ) {
            return <h3>{ battle.name } is full.</h3> 
        } else {
            return <h3>You are joining the { battle.name } battle.</h3>
        }
    }

    renderLoginScreens(){
        const { 
            displayPhoneNumberForm, displayVerificationCodeForm, displayNameForm,
            phoneNumber, verificationCode, name, errorMessage
        } = this.state;
        return (
            <div className = "login-screens">
                { this.renderHeaderText() }
                { errorMessage ? <p className = "error-message">{ errorMessage }</p> : null }
                { displayPhoneNumberForm ? (
                    <div>
                        <p>We will need to send you a one time passocde via sms.</p>
                        <PhoneNumberForm 
                            onChange = { this.onPhoneNumberChange.bind(this) }
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

    render(){
        const {isLoading, battle, displayPhoneNumberForm, phoneNumber } = this.state;

        return !isLoading && (
            <div className = "ViewerLogin">


                { !battle ? <BattleNotFound /> : null }
                { !!battle && !battle.startedOn ? (
                    <div className = "subscription-screen module">
                        <h3>{ battle.name } hasn't started yet.</h3>
                        { displayPhoneNumberForm ? (
                            <div>
                                <p>Enter your phone number below to get notified when it begins.</p>
                                <PhoneNumberForm 
                                    onChange = { this.onPhoneNumberChange.bind(this) }
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
                ) : null }
                { !!battle && !!battle.startedOn && !battle.endedOn ? (
                    <div className = "module">
                        <Image src = { Earbuds } alt = "Earbuds" className = "hero" />
                        { battle.startedOn ? this.renderLoginScreens() : this.renderSubscriptionScreens() }
                        <p><a href = "/">Home</a></p>
                    </div>
                ) : null }
                { !!battle && !!battle.startedOn && !!battle.endedOn ? (
                    <BattleEnded battle = { battle } />
                ) : null }
            </div>
        )
    }
}

export default ViewerLogin;