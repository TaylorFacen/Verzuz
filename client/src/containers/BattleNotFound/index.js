
import React from 'react';
import { Image, Button } from 'react-bootstrap';

import './BattleNotFound.css';

const Shuffle = require('../../images/shuffle.png');

export default () => (
    <div className = "BattleNotFound module">
        <Image className = "hero" src = { Shuffle } alt = "Shuffle icon"/>
        <h3>Oops, looks like that battle doesn't exist.</h3>
        <p>Why not create one?</p>
        <Button className = "cta" href = "/create-battle">Create Battle</Button>
        <p><a href = "/">Home</a></p>
    </div>
)