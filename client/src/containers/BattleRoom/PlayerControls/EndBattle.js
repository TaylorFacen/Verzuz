import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default ({ endBattle, toggleModal, show }) => (
    <div className = "EndBattle">
        <Button variant = "danger" onClick = { toggleModal }>End Battle</Button>
        <Modal show = { show } onHide={ toggleModal }>
            <Modal.Header closeButton>
                <Modal.Title>End Battle</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to end this battle?</Modal.Body>
            <Modal.Footer>
                <Button className = "cta" onClick = { endBattle }>
                    End Battle
                </Button>
            </Modal.Footer>
      </Modal>
    </div>
)