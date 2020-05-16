import React from 'react';
import { Form, Button, Col } from 'react-bootstrap';

export default ({ onSubmit, onChange, battleName, roundCount, audienceLimit, player1Email, player1Name, player2Name, player2Email, isValid }) => (
    <div className = "BattleDetails">
        <h2>Battle Details</h2>
        <Form onSubmit = { onSubmit }>
            <Form.Row>
                <Form.Group controlId="battleName">
                    <Form.Label>Battle Name</Form.Label>
                    <Form.Control 
                        type = "text"
                        value = { battleName }
                        name = "battleName"
                        onChange = { onChange }
                    />
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Col lg = { 6 } md = { 12 } sm = { 12 }>
                    <Form.Group controlId="roundCount">
                        <Form.Label>Rounds</Form.Label>
                        <Form.Control 
                            as = "select"
                            onChange = { onChange }
                            value = { roundCount }
                            name = "roundCount"
                        >
                            <option>5</option>
                            <option>10</option>
                            <option>20</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg = { 6 } md = { 12 } sm = { 12 }>
                    <Form.Group controlId="audienceLimit">
                        <Form.Label>Max Audience Size</Form.Label>
                        <Form.Control 
                            disabled
                            as = "select"
                            onChange = { onChange }
                            value = { audienceLimit }
                            name = "audienceLimit"
                        >
                            <option>10</option>
                        </Form.Control>
                        <Form.Text>
                            Higher audience limits coming soon.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Form.Row>
            <h2>Participants</h2>
            <Form.Row>
                <Col lg = { 6 } md = { 12 } sm = { 12 }>
                    <p>1st Participant</p>
                    <Form.Group controlId="player1Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type = "text"
                            value = { player1Name }
                            name = "player1Name"
                            onChange = { onChange }
                        />
                    </Form.Group>
                    <Form.Group controlId="player1Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type = "email"
                            value = { player1Email }
                            name = "player1Email"
                            onChange = { onChange }
                        />
                    </Form.Group>
                </Col>
                <Col lg = { 6 } md = { 12 } sm = { 12 }>
                    <p>2nd Participant</p>
                    <Form.Group controlId="player2Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type = "text"
                            value = { player2Name }
                            name = "player2Name"
                            onChange = { onChange }
                        />
                    </Form.Group>
                    <Form.Group controlId="player2Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type = "email"
                            value = { player2Email }
                            name = "player2Email"
                            onChange = { onChange }
                        />
                    </Form.Group>
                </Col>
            </Form.Row>
            <Button className = "cta" type = "submit" disabled = { !isValid }>Next</Button>
        </Form>
    </div>
)