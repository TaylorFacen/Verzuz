import React from 'react';

export default ({ userName }) => (
    <div className = "NewViewerNotification">
        <span className = "user-name">{ userName }</span> just joined.
    </div>
)