
import React from 'react';
import { Image } from 'react-bootstrap';

import './BattleEnded.css';

const Cassette = require('../../images/audio cassette.png');

export default ({ battle }) => {
    const roundCount = battle.currentRound < battle.roundCount ? battle.currentRound : battle.roundCount;
    const winnersByRound = battle.winnersByRound;

    if ( winnersByRound.filter(round => round.winners.length > 0).length > 0 ) {
        const winner = battle.winner;

        return (
            <div className = "BattleEnded module">
                <Image className = "hero" src = { Cassette } alt = "Audio cassette icon"/>
                <h3>{ battle.name } is over.</h3>
                <p>After { roundCount } rounds, { winner === "tie" ? <span>the battle ended in a tie. </span> : <span> { winner.player.name } won with { winner.score } points. </span> } </p>
                { winnersByRound.map(round => {
                    return (
                        <div key = { round.round }>
                            Round { round.round }: { round.winners.length === 1 ? round.winners[0].name : "Tie" }
                        </div>
                    )
                })}
                <p className = "home-link"><a href = "/">Home</a></p>
            </div>
        )
    } else {
        return (
            <div className = "BattleEnded module">
                <Image className = "hero" src = { Cassette } alt = "Audio cassette icon"/>
                <h3>{ battle.name } is over.</h3>
                <p className = "home-link"><a href = "/">Home</a></p>
            </div>
        )
    }
}