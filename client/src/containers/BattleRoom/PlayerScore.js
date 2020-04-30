import React from 'react';

export default ({ score }) => (
    <div className = "PlayerScore">
        <div className = "score-text">Score</div>
        <div className = "score">{ score }</div>
    </div>
)