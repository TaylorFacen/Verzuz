import React from 'react';
import { Button, Form } from 'react-bootstrap';

export default ({ onChange, onSubmit, phoneNumber }) => (
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
                    Standard messaging rates may apply. Only US numbers are allowed at this time.
                </Form.Text>
            </Form.Group>
            <Button 
                type = "submit"
                className = "cta"
                disabled = { phoneNumber.length < 10 }
            >Submit</Button>
        </Form>
    </div>
)