import React from 'react';

export default ({ playerName, isActive }) => (
    <div className = { (isActive ? "active-player " : "") + "VideoPlayer module"}>
        <div className = "video">
            The video plays here
        </div>
        <div className = "player-name">
            { playerName }
        </div>
    </div>
)