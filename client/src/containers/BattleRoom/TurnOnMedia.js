import React from 'react';
import { Button } from 'react-bootstrap';
import { AiOutlinePlayCircle } from 'react-icons/ai';

export default ({ toggleMedia }) => (
    // User has to have some interaction on the DOM before being able to connect to the video/audio stream
    <Button size = "sm" onClick = { toggleMedia }><AiOutlinePlayCircle /><div>Turn on Audio</div></Button>
)