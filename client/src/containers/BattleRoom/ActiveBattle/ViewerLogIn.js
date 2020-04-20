import React, { Component } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const PhoneNumberForm = ({ onChange, onSubmit, phoneNumber }) => (
    <div className = "PhoneNumberForm">
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="phoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control 
                    type = "tel"
                    value = { phoneNumber }
                    name = "phoneNumber"
                    onChange = { onChange }
                />
                <Form.Text className = "text-muted">
                    We will need to send you a one time passocde via sms. Standard messaging rates may apply. Only US numbers are allowed at this time.
                </Form.Text>
            </Form.Group>
            <Button 
                type = "submit"
                disabled = { phoneNumber.length !== 10 }
            >Submit</Button>
        </Form>
    </div>
)

const VerificationCodeForm = ({ onChange, onSubmit, verificationCode }) => (
    <div className = "VerificationCodeForm">
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="verificationCode">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control 
                    type = "text"
                    value = { verificationCode }
                    name = "verificationCode"
                    onChange = { onChange }
                />
            </Form.Group>
            <Button 
                type = "submit"
                disabled = { verificationCode === 0 }
            >Submit</Button>
        </Form>
    </div>
)

const DisplayNameForm = ({ onChange, onSubmit, displayName }) => (
    <div className = "VerificationCodeForm">
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="displayName">
                <Form.Label>Display Name</Form.Label>
                <Form.Control 
                    type = "text"
                    value = { displayName }
                    name = "displayName"
                    onChange = { onChange }
                />
                <Form.Text className = "text-muted">
                    This name will be displayed when you post a comment. Note, this cannot be changed later.
                </Form.Text>
            </Form.Group>
            <Button 
                type = "submit"
                disabled = { displayName.length <= 3 }
            >Submit</Button>
        </Form>
    </div>
)

class ViewerLogin extends Component {
    state = {
        displayPhoneNumberForm: true,
        displayVerificationCodeForm: false,
        displayDisplayNameForm: false,
        displayName: '',
        phoneNumber: '',
        verificationCode: ''
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    onSubmitPhoneNumber = e => {
        e.preventDefault();

        // Todo: Check to see if phone number already in room

        // Todo: Send out verification via Twilio Verify

        this.setState({
            displayPhoneNumberForm: false,
            displayVerificationCodeForm: true,
            displayDisplayNameForm: false
        })
    }

    onSubmitVerificationCode = e => {
        e.preventDefault();

        // Todo: Check to see if code is correct via Twilio Verify

        this.setState({
            displayPhoneNumberForm: false,
            displayVerificationCodeForm: false,
            displayDisplayNameForm: true
        })
    }

    onSubmitDisplayName = e => {
        const { phoneNumber, displayName } = this.state;
        const { setViewerDetails } = this.props;
        e.preventDefault();

        // Todo: Check to see if user in chat already has display name
        setViewerDetails(phoneNumber, displayName);
    }

    render(){
        const { 
            displayName, phoneNumber, verificationCode, 
            displayPhoneNumberForm, displayVerificationCodeForm, displayDisplayNameForm
        } = this.state;
        const { battleName, show } = this.props;

        return (
            <Modal show = { show }>
                <Modal.Body>
                    <p>You are joining the { battleName } battle.</p>
                    { displayPhoneNumberForm ? (
                        <PhoneNumberForm 
                            onChange = { this.onChange.bind(this) }
                            onSubmit = { this.onSubmitPhoneNumber.bind(this) }
                            phoneNumber = { phoneNumber }
                        /> 
                    ) : null }
                    { displayVerificationCodeForm ? (
                        <VerificationCodeForm 
                            onChange = { this.onChange.bind(this) }
                            onSubmit = { this.onSubmitVerificationCode.bind(this) }
                            verificationCode = { verificationCode }
                        /> 
                    ) : null }
                    { displayDisplayNameForm ? (
                        <DisplayNameForm 
                            onChange = { this.onChange.bind(this) }
                            onSubmit = { this.onSubmitDisplayName.bind(this) }
                            displayName = { displayName }
                        /> 
                    ) : null }
                </Modal.Body>
            </Modal>
        )
    }
}

export default ViewerLogin;