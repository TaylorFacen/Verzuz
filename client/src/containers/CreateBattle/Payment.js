import React from 'react';
import { Form, Button } from 'react-bootstrap';

export default ({ onSubmit, goBackToBattleDetails}) => (
    <div className = "Payment">
        <Form onSubmit = { onSubmit }>
            <div className = "form-buttons">
                <Button variant = "link" onClick = { goBackToBattleDetails }>Back</Button>
                <Button type = "submit">Submit Payment</Button>
            </div>
        </Form>
    </div>
)