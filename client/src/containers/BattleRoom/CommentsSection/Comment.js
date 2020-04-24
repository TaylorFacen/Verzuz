import React from 'react';

export default ({ comment }) => (
    <div className = "Comment">
        <div className = "user-name comment-author">{ comment.name }</div>
        <p className = "comment-body">{ comment.text }</p>
    </div>
)