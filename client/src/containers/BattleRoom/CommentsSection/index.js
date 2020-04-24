import React, { Component } from 'react';

import './Comments.css';
import Comments from './Comments';

class CommentsSection extends Component {
    componentDidMount(){
        this.scrollToBottom();        
    }

    componentDidUpdate(){
        this.scrollToBottom();        
    }

    scrollToBottom(){
        // Make sure comments start at the bottom
        const comments = document.getElementById("comments");
        comments.scrollTop = comments.offsetHeight;
    }

    render() {
        const { comments } = this.props;
        const sortedComments = comments.sort((c1, c2) => c1.createdOn >= c2.createdOn ? 1 : -1 )

        // Make sure to sort comments by timestamp

        return (
            <div className = "CommentsSection module">
                <Comments comments = { sortedComments } />
            </div>
        )
    }
}

export default CommentsSection;