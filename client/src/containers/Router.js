import React, { Component } from 'react';
import {
    BrowserRouter,
    Route
} from 'react-router-dom';

import Home from './Home';
import BattleRoom from './BattleRoom';
import CreateBattle from './CreateBattle';
import PlayerLogin from './PlayerLogin';
import ViewerLogin from './ViewerLogin';

class Router extends Component {
    render(){
        return (
            <BrowserRouter>
                <Route exact path = '/' component = { Home } />
                <Route exact path = '/battles/:battleId' component = { BattleRoom } />
                <Route exact path = '/battles/:battleId/host' component = { PlayerLogin } />
                <Route exact path = '/battles/:battleId/join' component = { ViewerLogin } />
                <Route exact path = '/create-battle' component = { CreateBattle } />
            </BrowserRouter>
        )
    }
}

export default Router;