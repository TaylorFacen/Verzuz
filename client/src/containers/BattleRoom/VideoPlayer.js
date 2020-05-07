import React from 'react';
import { Button } from 'react-bootstrap';

export default ({ playerName, isActive, videoPlayerId, isMediaPlaying, togglePlayMedia }) => (
    <div className = { (isActive ? "active-player " : "inactive-player ") + "VideoPlayer module"}>
        <div id = { videoPlayerId } className = "video">
        </div>
        <div className = "player-name">
            { playerName } 
            { videoPlayerId === "local_stream" ? (
            <Button className = "media-toggle" variant = "light" size = "sm" onClick = { togglePlayMedia }>{ isMediaPlaying ? "Stop Media" : "Start Media" }</Button>
        ) : null}
        </div>
    </div>
)