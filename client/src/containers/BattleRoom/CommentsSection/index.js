import React, { Component } from 'react';

import './Comments.css';
import Comments from './Comments';
import NewCommentForm from './NewCommentForm';

import battleService from '../../../services/battleService';

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
        comments.scrollTop = comments.offsetHeight;
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        })
    }

    postComment = e => {
        e.preventDefault();
        const { battleId, name, userId } = this.props
        const { newComment } = this.state;
        battleService.postComment(battleId, userId, name, newComment)
        .then(() => this.setState({ newComment: ''}))
        .catch(error =>console.log(error))
    }

    render() {
        const { comments, name } = this.props;
        const { newComment } = this.state;
        const sortedComments = comments.sort((c1, c2) => c1.createdOn >= c2.createdOn ? 1 : -1 )
        // Make sure to sort comments by timestamp
        return (
            <div className = "CommentsSection module">
                <Comments comments = { sortedComments } />
                <NewCommentForm 
                    name = { name }
                    newComment = { newComment }
                    onChange = { this.onChange.bind(this) }
                    postComment = { this.postComment.bind(this) }
                />
            </div>
        )
    }
}

export default CommentsSection;