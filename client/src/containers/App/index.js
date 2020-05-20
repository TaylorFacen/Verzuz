import React, { Component } from 'react';
import './App.css';

import Router from '../Router';

window.analytics.load(process.env.REACT_APP_SEGMENT_ID);

class App extends Component {
    render(){
        return (
            <div className = "App">
                <Router />
            </div>
        )
    }
}

export default App;