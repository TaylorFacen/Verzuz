import React from 'react';

export default ({ battles, onClick }) => (
    <ul className = "SearchResults">
        { battles.length > 0 ? (
            battles.map(battle => (
                <li key = { battle._id }><a onClick = {() => onClick(battle._id)} key = { battle._id } href = {`/battles/${battle._id}`}>{ battle.name }</a></li>
            ))
        ) : "No Battles Found"}
    </ul>
)