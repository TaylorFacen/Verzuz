import React from 'react';

export default ({ playerName, isActive, videoPlayerId}) => (
    <div className = { (isActive ? "active-player " : "inactive-player ") + "VideoPlayer module"}>
        <div id = { videoPlayerId } className = "video">
        </div>
        <div className = "player-name">
            { playerName } 
        </div>
    </div>
)