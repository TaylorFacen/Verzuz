import React from 'react';
import { Navbar, Button } from 'react-bootstrap';

export default ({ battle, leaveBattle }) => (
    <Navbar className = "Navigation justify-content-between">
        <Navbar.Brand href = '/'>Verzuz</Navbar.Brand>
        <Navbar.Text>
            <a href = {`/battles/${battle.id}`}>{ battle.name }</a>
        </Navbar.Text>
        <Navbar.Text>
            <Button onClick = { leaveBattle } variant="link">Leave</Button>
        </Navbar.Text>
    </Navbar>
)