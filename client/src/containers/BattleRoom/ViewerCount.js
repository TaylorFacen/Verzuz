import React from 'react';

export default ({ viewerCount }) => (
    <div className = "ViewerCount module">
        <span className = "viewer-count">{ viewerCount }</span>
        <span className = "viewer-text">Viewers</span>
    </div>
)