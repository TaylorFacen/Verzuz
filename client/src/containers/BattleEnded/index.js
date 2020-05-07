
import React from 'react';
import { Image } from 'react-bootstrap';

import './BattleEnded.css';
import battleService from '../../services/battleService';

const Cassette = require('../../images/audio cassette.png');

export default ({ battle }) => {
    const roundCount = battle.currentRound < battle.roundCount ? battle.currentRound : battle.roundCount;
    const winnerByRound = battleService.calculateWinnerByRound(battle.scores);
    if ( winnerByRound ) {
        const players = Array.from(new Set(winnerByRound.map(score => score.winner)))
        const playerFinalScores = players.map(player => ({
            player: player,
            score: winnerByRound.filter(score => score.winner === player).length
        }))
        const winner = playerFinalScores.reduce((winner, curr) => {
            if ( curr.score > winner.score ) {
                return curr
            } else {
                return winner
            }
        }, playerFinalScores[0]);

        const playerName = battle.participants.find(p => p.email === winner.player)?.name;

        return (
            <div className = "BattleEnded module">
                <Image className = "hero" src = { Cassette } alt = "Audio cassette icon"/>
                <h3>{ battle.name } is over.</h3>
                <p>After { roundCount } rounds, { playerFinalScores[0]?.score === playerFinalScores[1]?.score ? <span>the battle ended in a tie. </span> : <span>{ playerName } won with { winner.score } points. </span> } </p>
                { winnerByRound.map(round => {
                    const playerName = battle.participants.find(p => p.email === round.winner)?.name;
                    return (
                        <div key = { round.round }>
                            Round { round.round }: { playerName }
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