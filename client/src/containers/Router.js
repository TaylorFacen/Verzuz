import React, { Component } from 'react';
import {
    BrowserRouter,
    Route
} from 'react-router-dom';

import Home from './Home';
import Room from './Room';
import CreateBattle from './CreateBattle';

class Router extends Component {
    render(){
        return (
            <BrowserRouter>
                <Route exact path = '/' component = { Home } />
                <Route exact path = '/room/:roomId' component = { Room } />
                <Route exact path = '/create-battle' component = { CreateBattle } />
            </BrowserRouter>
        )
    }
}

export default Router;