import React from 'react';
import { Image } from 'react-bootstrap';

const Equalizer = require('../../images/equalizer.png')

export default () => (
    <div className = "Overview">
        <div className = "content">
            <h2>How it Works</h2>
            <Image src = { Equalizer } alt = "Equalizer" className = "hero"/>
            <ul>
                <li>Create your battle</li>
                <li>Access your battle room ahead of the big day to get set up</li>
                <li>Start the battle at any time</li>
                <li>Battle it out via live video</li>
                <li>Invite others to comment and vote in real time</li>
            </ul>
        </div>
    </div>
)