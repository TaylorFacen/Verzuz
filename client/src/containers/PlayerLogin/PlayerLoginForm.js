import React from 'react';
import { Form, Button } from 'react-bootstrap';

export default ({ accessCode, onChange, onSubmit }) => (
    <Form onSubmit = { onSubmit } className = "PlayerLoginForm">
    <Form.Group controlId="accessCode">
                <Form.Control 
                    type = "text"
                    value = { accessCode }
                    name = "accessCode"
                    onChange = { onChange }
                    placeholder = "Access Code"
                />
                <Form.Text className = "text-muted">
                    Your access code can be found in your invite email
                </Form.Text>
            </Form.Group>
        <Button className = "cta" type = "submit" disabled = { accessCode.length < 6 }>Enter Battle</Button>
    </Form>
)