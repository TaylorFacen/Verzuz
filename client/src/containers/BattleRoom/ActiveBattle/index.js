import React, { Component } from 'react';

import ViewerLogin from './ViewerLogIn';

class ActiveBattle extends Component {
    state = {
        phoneNumber: '',
        displayName: '',
        role: '',
        displayViewerLogin: false
    }

    componentDidMount(){
        this.setState({
            displayViewerLogin: true
        })
    }

    setViewerDetails = (phoneNumber, displayName) => {
        // Subscribe to events on pusher

        // Load previous comments

        // Subscribe to Agora broadcast

        // Set state
        this.setState({
            phoneNumber,
            displayName,
            role: 'viewer',
            displayViewerLogin: false
        })
    }

    render(){
        const { battle } = this.props;
        const { displayViewerLogin } = this.state;

        return (
            <div className = "ActiveBattle">
                { displayViewerLogin ? (
                    <ViewerLogin 
                        show = { displayViewerLogin } 
                        battleName = { battle.name } 
                        setViewerDetails = { this.setViewerDetails.bind(this) }    
                    />
                ) : null }
                Battle
            </div>
        )
    }
}

export default ActiveBattle;