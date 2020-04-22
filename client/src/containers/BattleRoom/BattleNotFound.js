import React from 'react';
import { Image, Button } from 'react-bootstrap';

const Shuffle = require('../../images/shuffle.png');

export default () => (
    <div className = "BattleNotFound">
        <Image className = "hero" src = { Shuffle } />
        <h3>Oops, looks like that battle doesn't exist.</h3>
        <p>Why not create one?</p>
        <Button className = "cta" href = "/create-battle">Create Battle</Button>
        <p><a href = "/">Home</a></p>
    </div>
)