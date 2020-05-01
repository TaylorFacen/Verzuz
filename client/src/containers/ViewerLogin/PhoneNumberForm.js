import React from 'react';
import { Button, Form } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export default ({ onChange, onSubmit, phoneNumber }) => (
    <div className = "PhoneNumberForm">
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="phoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <PhoneInput
                    country={'us'}
                    value={ phoneNumber }
                    onChange={ onChange }
                    preferredCountries = { ['us'] }
                    enableSearch = { true }
                />
            </Form.Group>
            <Button 
                type = "submit"
                className = "cta"
                disabled = { phoneNumber.length < 10 }
            >Submit</Button>
        </Form>
    </div>
)