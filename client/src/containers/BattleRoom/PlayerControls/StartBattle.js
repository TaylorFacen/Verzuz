import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default ({ startBattle, toggleModal, show }) => (
    <div className = "StartBattle">
        <Button onClick = { toggleModal } className = "cta">Start Battle</Button>
        <Modal show = { show } onHide={ toggleModal }>
            <Modal.Header closeButton>
                <Modal.Title>Start Battle</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to start this battle?</Modal.Body>
            <Modal.Footer>
                <Button className = "cta" onClick = { startBattle }>
                    Start Battle
                </Button>
            </Modal.Footer>
      </Modal>
    </div>
)