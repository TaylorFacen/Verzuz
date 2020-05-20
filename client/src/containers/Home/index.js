import React from 'react';
import { Button, Image } from 'react-bootstrap';

import './Home.css';
import BattleSearch from './BattleSearch';

const Headphones = require('../../images/headphone.png');

export default () => {
    window.analytics.page('Home');

    return (
        <div className = "Home module">
            <h1>Verzuz App</h1>
            <Image src = { Headphones } alt = "Headphones" className = "hero"/>
            <p>With the Verzuz app, you can battle it out to see who has the best music playlist. Viewers can watch, comment, and vote in real-time.</p>
            <div className = "header"><BattleSearch /></div>
            <p>Don't see the battle you're looking for? Why not create one!</p>
            <Button className = "create-battle-btn cta" href = "/create-battle">Create Battle</Button>
        </div>
    )
};