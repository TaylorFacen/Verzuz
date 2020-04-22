import React from 'react';
import { Button } from 'react-bootstrap';

import './Home.css';
import BattleSearch from './BattleSearch';

export default () => (
    <div className = "Home">
        <div className = "header"><BattleSearch /></div>
        <Button className = "create-battle-btn cta" href = "/create-battle">Create Battle</Button>
    </div>
);