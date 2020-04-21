import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { GoSearch } from 'react-icons/go';

export default ({ searchInput, onChange }) => {
    return (
        <InputGroup className = "SearchField">
            <InputGroup.Prepend>
                <InputGroup.Text id = "searchInput" className = "search-icon"><GoSearch /></InputGroup.Text>
            </InputGroup.Prepend>
                <Form.Control 
                    type = "text"
                    value = { searchInput }
                    name = "searchInput"
                    onChange = { onChange }
                    placeholder = "Battle Name"
                />
        </InputGroup>
    )
}