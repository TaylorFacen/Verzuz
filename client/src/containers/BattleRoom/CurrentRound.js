import React from 'react';

export default ({ battle }) => {
    const { currentRound, roundCount } = battle;

    if ( currentRound ) {
        if ( currentRound > roundCount ) {
            const winner = battle.winner;
            if ( winner === 'tie' ) {
                return <h2>It's a Tie!</h2>
            } else {
                return winner.name ? <h2>{ winner.name } is the winner!</h2> : null
            }
        } else {
            return <h2>Round { currentRound }<span className = "round-count"> / {roundCount }</span></h2>
        }
    } else {
        return null
    }

    
}