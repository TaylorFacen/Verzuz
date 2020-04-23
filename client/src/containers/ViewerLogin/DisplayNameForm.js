import React from 'react';
import { Button, Form } from 'react-bootstrap';

export default ({ onChange, onSubmit, name }) => (
    <div className = "VerificationCodeForm">
        <Form onSubmit = { onSubmit }>
            <Form.Group controlId="name">
                <Form.Label>Display Name</Form.Label>
                <Form.Control 
                    type = "text"
                    value = { name }
                    name = "name"
                    onChange = { onChange }
                />
                <Form.Text className = "text-muted">
                    This name will be displayed when you post a comment. Note, this cannot be changed later.
                </Form.Text>
            </Form.Group>
            <Button 
                className = "cta"
                type = "submit"
                disabled = { name.length <= 3 }
            >Submit</Button>
        </Form>
    </div>
)