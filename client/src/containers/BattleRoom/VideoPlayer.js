import React from 'react';

export default ({ playerName }) => (
    <div className = "VideoPlayer module">
        <div className = "video">
            The video plays here
        </div>
        <div className = "player-name">
            { playerName }
        </div>
    </div>
)