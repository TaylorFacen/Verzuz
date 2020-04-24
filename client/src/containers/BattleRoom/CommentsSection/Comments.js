import React from 'react';

import Comment from './Comment';
import NewViewerNotification from './NewViewerNotification';

export default ({ comments }) => (
    <div id = "comments" className = "Comments" >
        { comments.map(comment => {
            if (comment.userId === "system" && comment.text === "joined") {
                return <NewViewerNotification userName = { comment.name } key = { comment.createdOn }/>
            } else {
                return <Comment comment = { comment } key = { comment.createdOn }/>
            }
        })}
    </div>
)