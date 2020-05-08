import React from 'react';
import { Modal } from 'react-bootstrap';

import BattleEnded from '../BattleEnded';

export default ({ battle }) => (
    <Modal className = "BattleEndedModal" show = {!!battle.endedOn}>
        <Modal.Body>
            <BattleEnded battle = { battle }/>
        </Modal.Body>
    </Modal>
)