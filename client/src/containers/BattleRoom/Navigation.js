import React from 'react';
import { Navbar, Button } from 'react-bootstrap';

export default ({ battleName, battleId, leaveBattle }) => (
    <Navbar className = "Navigation justify-content-between">
        <Navbar.Brand href = '/'>Verzuz</Navbar.Brand>
        <Navbar.Text>
            <a href = {`/battles/${battleId}`}>{ battleName }</a>
        </Navbar.Text>
        <Navbar.Text>
            <Button onClick = { leaveBattle } variant="link">Leave</Button>
        </Navbar.Text>
    </Navbar>
)