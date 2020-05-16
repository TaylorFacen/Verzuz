import React, { Component } from 'react';

import './Comments.css';
import Comments from './Comments';
import NewCommentForm from './NewCommentForm';

class CommentsSection extends Component {
    state = {
        newComment: ''
    }

    componentDidMount(){
        this.scrollToBottom();        
    }

    componentDidUpdate(){
        this.scrollToBottom();        
    }

    scrollToBottom(){
        // Make sure comments start at the bottom
        const comments = document.getElementById("comments");
        comments.scrollTop = comments.scrollHeight;
    }

    onChange = e => {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    postComment = e => {
        e.preventDefault();
        const { battle, user } = this.props;
        const { newComment } = this.state;
        battle.postComment(user, newComment)
        .then(() => this.setState({ newComment: ''}))
        .catch(error =>console.log(error))
    }

    render() {
        const { battle, user } = this.props;
        const { newComment } = this.state;
        // Make sure to sort comments by timestamp
        const sortedComments = battle.comments.sort((c1, c2) => c1.createdOn >= c2.createdOn ? 1 : -1 )

        return (
            <div className = "CommentsSection module">
                <Comments comments = { sortedComments } />
                <NewCommentForm 
                    name = { user.name }
                    newComment = { newComment }
                    onChange = { this.onChange.bind(this) }
                    postComment = { this.postComment.bind(this) }
                />
            </div>
        )
    }
}

export default CommentsSection;