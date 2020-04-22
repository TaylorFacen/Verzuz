import React from 'react';
import { Form, Button } from 'react-bootstrap';

export default ({ phoneNumber, onSubmit, onChange }) => (
    <div className = "PhoneNumberForm">
        <p>Enter your phone number below to get notified when it begins.</p>
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="phoneNumber">
                <Form.Control 
                    type = "tel"
                    value = { phoneNumber }
                    name = "phoneNumber"
                    onChange = { onChange }
                    placeholder = "Phone Number"
                />
                <Form.Text className = "text-muted">
                    Standard messaging rates may apply. Only US numbers are allowed at this time.
                </Form.Text>
            </Form.Group>
            <Button className = "cta" type = "submit" disabled = { phoneNumber.length !== 10 }>Submit</Button>
        </Form>
    </div>
)