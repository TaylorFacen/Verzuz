import React from 'react';
import { FaRegEye } from 'react-icons/fa';

export default ({ viewers }) => (
    <div className = "ViewerCount module">
        <span className = "viewer-count">{ viewers.length }</span>
        <span className = "viewer-icon"><FaRegEye /></span>
    </div>
)