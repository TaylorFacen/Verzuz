import React from 'react';
import { Button } from 'react-bootstrap';

export default ({ isCurrentVote, castVote }) => {
    if ( isCurrentVote ) {
        return <p>Your Vote</p>
    } else {
        return (
            <Button onClick = { castVote } className = "cta">
                Vote
            </Button>
        )
    }
}