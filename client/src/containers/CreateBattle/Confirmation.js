import React from 'react';

export default ({ battleName, participant1Name, participant2Name, battleId, roundCount, audienceLimit }) => (
    <div className = "Confirmation">
        <h2>You're All Set!</h2>
        <div className = "text">
            { battleName } is ready to go for { roundCount } rounds with an audience limit of { audienceLimit }. Instructions have been emailed to { participant1Name } and { participant2Name }.
        </div>
        <div className = "links">
            { battleId ? <a className = "battle-page-link cta" href = {`/battles/${battleId}`}>Go to battle page</a> : null }
            <a className = "home-link" href = "/">Back to the Home screen</a>
        </div>
    </div>
)