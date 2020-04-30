import React from 'react';

export default ({ currentRound, roundCount, scores, participants }) => {
    if ( currentRound > roundCount ) {
        const players = Array.from(new Set(scores.map(score => score.winner)))
        const playerFinalScores = players.map(player => ({
            player: player,
            score: scores.filter(score => score.winner === player).length
        }))
        
        if (playerFinalScores[0].score === playerFinalScores[1].score) {
            return <h2>It's a Tie!</h2>
        } else {
            const winner = playerFinalScores.reduce((winner, curr) => {
                if ( curr.score > winner.score ) {
                    return curr
                } else {
                    return winner
                }
            }, playerFinalScores[0]);

            return <h2>{ participants.find(p => p.email === winner.player).name } is the winner!</h2>
        }
    } else {
        return <h2>Round { currentRound }<span className = "round-count"> / {roundCount }</span></h2>
    }
}