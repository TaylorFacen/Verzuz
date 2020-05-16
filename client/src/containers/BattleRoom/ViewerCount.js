import React from 'react';
import { FaRegEye } from 'react-icons/fa';

export default ({ viewerCount }) => (
    <div className = "ViewerCount module">
        <span className = "viewer-count">{ viewerCount }</span>
        <span className = "viewer-icon"><FaRegEye /></span>
    </div>
)