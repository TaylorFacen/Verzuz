import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FiSend } from 'react-icons/fi';

export default ({ newComment, name, onChange, postComment }) => (
    <div className = "NewCommentForm">
        <p className = "display-name">Your display name: <span className = "user-name">{ name }</span></p>
        <Form onSubmit = { postComment }>
            <Form.Control 
                as = "textarea" 
                rows="2"
                size="sm"
                value = { newComment }
                name = "newComment"
                onChange = { onChange }
                placeholder = "New Comment..."
            />
            <Button className = "cta" type = "submit" disabled = { newComment.trim().length === 0 }><FiSend /></Button>
        </Form>
    </div>
)