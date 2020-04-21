import React from 'react';
import { Form, Button } from 'react-bootstrap';

export default ({ onSubmit }) => (
    <div className = "BattleDetails">
        <Form onSubmit = { onSubmit }>
            <Button className = "cta" type = "submit">Next</Button>
        </Form>
    </div>
)