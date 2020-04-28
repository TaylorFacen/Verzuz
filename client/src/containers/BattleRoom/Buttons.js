import React from 'react';
import { Button } from 'react-bootstrap';

const StartBattleButton = ({ startBattle }) => (
    <Button onClick = { startBattle } className = "StartBattleButton cta">
        Start Battle
    </Button>
);

const EndBattleButton = ({ endBattle }) => (
    <Button onClick = { endBattle } className = "EndBattleButton cta">
        End Battle
    </Button>
);

export { StartBattleButton, EndBattleButton};