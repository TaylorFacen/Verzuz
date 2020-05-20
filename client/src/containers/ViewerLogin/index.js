import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './ViewerLogin.css';
import PhoneNumberForm from './PhoneNumberForm';
import VerificationCodeForm from './VerificationCodeForm';
import DisplayNameForm from './DisplayNameForm';
import BattleEnded from '../BattleEnded';
import BattleNotFound from '../BattleNotFound';

import { Battle } from '../../services/battle';
import cookieService from '../../services/cookieService';

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

    async componentDidMount(){
        const battleId = this.props.match.params.battleId.toUpperCase();
        const cookieResp = cookieService.parseCookie(battleId);
        const battle = new Battle(battleId);
        await battle.init();

        if ( !!battle.startedOn && !battle.endedOn && cookieResp.hasAccess ) {
            // User is already authenticated
            window.location.replace(`/battles/${battleId}`)
        } else {
            window.analytics.page('Viewer Log In');
            
            this.setState({
                isLoading: false,
                battle
            })
        }
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

    canEnterBattle = async ( battle, phoneNumber ) => {
        if ( battle.audienceLimit === battle.viewers.filter(viewer => !viewer.leftOn ).length ) {
            // If user is in battle from another client, allow the user in
            if ( battle.viewers.filter(viewer => viewer.phoenNumber === phoneNumber ).length > 0 ) {
                return true 
            } else {
                this.setState({
                    displayPhoneNumberForm: false,
                    displayVerificationCodeForm: false,
                    displayNameForm: false,
                    isFull: true
                })

                return false
            }
        } else {
            // Check to see if user is on blacklist
            if ( battle.blacklist.map(v => v.phoneNumber).includes(phoneNumber) ) {
                this.setState({
                    displayPhoneNumberForm: false,
                    displayVerificationCodeForm: false,
                    displayNameForm: false,
                    isBlocked: true
                })

                return false
            } else {
                return true
            }
        }
    }

    onSubmitPhoneNumber = async e => {
        e.preventDefault();
        const { battle, phoneNumber } = this.state;
        // Check to see if user can eneter
        const canEnter = await this.canEnterBattle( battle, phoneNumber );
        if ( canEnter ) {
            battle.getVerificationCode(phoneNumber)
            .then(() => {
                this.setState({
                    displayPhoneNumberForm: false,
                    displayVerificationCodeForm: true,
                    displayNameForm: false
                })
            })
        }
    }

    onSubmitVerificationCode = e => {
        e.preventDefault();
        const { battle, verificationCode, phoneNumber } = this.state;

        battle.checkVerificationCode(phoneNumber, verificationCode)
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

    onSubmitDisplayName = async e => {
        e.preventDefault();
        const { battle, phoneNumber, name } = this.state;

        // Check to see if user in chat already has display name
        const activeViewersWithName = battle.viewers.filter(viewer => viewer.name === name && !viewer.leftOn && viewer.phoneNumber !== phoneNumber);
        if ( activeViewersWithName.length > 0 ) {
            this.setState({
                errorMessage: "That name is already taken."
            })
        } else {
            // Post viewer to battle 
            const viewer = await battle.postViewer(name, phoneNumber)
            // Set cookie
            cookieService.setCookie(battle.id, viewer._id, "viewer")
            .then(() => {
                // Redirect to battle page
                window.location.replace(`/battles/${battle.id}`)
            })
        }
    }

    onCreateSubscription = e => {
        e.preventDefault();

        const { battle, phoneNumber } = this.state;

        battle.postSubscriber(phoneNumber )
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
                { !battle.isBattle ? <BattleNotFound /> : null }
                { battle.isBattle && !battle.startedOn ? (
                    <div className = "subscription-screen module">
                        <h3>{ battle.name } hasn't started yet.</h3>
                        { displayPhoneNumberForm ? (
                            <div>
                                <p>Enter your phone number below to get notified when it begins.</p>
                                <PhoneNumberForm 
                                    onChange = { this.onPhoneNumberChange.bind(this) }
                                    onSubmit = { this.onCreateSubscription.bind(this) }
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
                { battle.isBattle && !!battle.startedOn && !battle.endedOn ? (
                    <div className = "module">
                        <Image src = { Earbuds } alt = "Earbuds" className = "hero" />
                        { battle.startedOn ? this.renderLoginScreens() : this.renderSubscriptionScreens() }
                        <p><a href = "/">Home</a></p>
                    </div>
                ) : null }
                { battle.isBattle && !!battle.startedOn && !!battle.endedOn ? (
                    <BattleEnded battle = { battle } />
                ) : null }
            </div>
        )
    }
}

export default ViewerLogin;