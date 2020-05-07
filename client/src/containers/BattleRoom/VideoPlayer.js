import React from 'react';
import { Button } from 'react-bootstrap';
import { AiOutlineAudio, AiOutlineAudioMuted } from 'react-icons/ai'

export default ({ player, isActive, videoPlayerId, toggleAudio}) => (
    <div className = { (isActive ? "active-player " : "inactive-player ") + "VideoPlayer module"}>
        <div id = { videoPlayerId } className = "video">
        </div>
        <div className = "player-name">
            { player.name } 
            { player.isStreaming ? (
                <Button variant = "link" className = "toggle-audio-button" onClick = { toggleAudio }>
                    { player.isAudioConnected ? <AiOutlineAudio /> : <AiOutlineAudioMuted />}
                </Button>
            ) : null }
        </div>
    </div>
)