import React from 'react';

export default ({ battles, onClick }) => (
    <div className = "SearchResults">
        { battles.length > 0 ? (
            battles.map(battle => (
                <div className = "battle-name" key = { battle._id } onClick = { () => onClick(battle._id) }>
                    { battle.name }
                </div>
            ))
        ) : "No Battles Found"}
        
    </div>
)