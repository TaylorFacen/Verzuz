import React from 'react';

export default ({ currentRound, roundCount }) => (
    <h2>Round { currentRound }<span className = "round-count"> / {roundCount }</span></h2>
)