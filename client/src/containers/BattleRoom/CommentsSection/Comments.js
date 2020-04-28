import React from 'react';

import Comment from './Comment';
import NewViewerNotification from './NewViewerNotification';

export default ({ comments }) => (
    <div id = "comments" className = "Comments" >
        { comments.length > 0 ? (
            comments.map(comment => {
                if (comment.userId === "system" && comment.text === "joined") {
                    return <NewViewerNotification userName = { comment.name } key = { comment._id }/>
                } else {
                    return <Comment comment = { comment } key = { comment._id }/>
                }
            })
        ) : <p>No comments yet. Why not post one?</p>}
        
    </div>
)