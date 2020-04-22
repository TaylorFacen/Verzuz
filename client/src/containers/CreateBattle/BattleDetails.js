import React from 'react';
import { Form, Button, Col } from 'react-bootstrap';

export default ({ onSubmit, onChange, battleName, rounds, audienceLimit, participant1Email, participant1Name, participant2Name, participant2Email, isValid }) => (
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
                    <Form.Group controlId="rounds">
                        <Form.Label>Rounds</Form.Label>
                        <Form.Control 
                            as = "select"
                            onChange = { onChange }
                            value = { rounds }
                            name = "rounds"
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
                    <Form.Group controlId="participant1Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type = "text"
                            value = { participant1Name }
                            name = "participant1Name"
                            onChange = { onChange }
                        />
                    </Form.Group>
                    <Form.Group controlId="participant1Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type = "email"
                            value = { participant1Email }
                            name = "participant1Email"
                            onChange = { onChange }
                        />
                    </Form.Group>
                </Col>
                <Col lg = { 6 } md = { 12 } sm = { 12 }>
                    <p>2nd Participant</p>
                    <Form.Group controlId="participant2Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type = "text"
                            value = { participant2Name }
                            name = "participant2Name"
                            onChange = { onChange }
                        />
                    </Form.Group>
                    <Form.Group controlId="participant2Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type = "email"
                            value = { participant2Email }
                            name = "participant2Email"
                            onChange = { onChange }
                        />
                    </Form.Group>
                </Col>
            </Form.Row>
            <Button className = "cta" type = "submit" disabled = { !isValid }>Next</Button>
        </Form>
    </div>
)