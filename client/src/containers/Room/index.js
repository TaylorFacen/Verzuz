import React, { Component } from 'react';

class Room extends Component {
    render(){
        return (
            <div className = "Room">
                Room: {this.props.match.params.roomId}
            </div>
        )
    }
}

export default Room;