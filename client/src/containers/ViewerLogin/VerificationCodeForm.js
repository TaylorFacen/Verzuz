import React from 'react';
import { Button, Form } from 'react-bootstrap';

export default ({ onChange, onSubmit, verificationCode }) => (
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
                className = "cta"
                type = "submit"
                disabled = { verificationCode === 0 }
            >Submit</Button>
        </Form>
    </div>
)