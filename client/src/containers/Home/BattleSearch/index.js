import React, { Component } from 'react';

import './BattleSearch.css';
import SearchField from './SearchField';

import battleService from '../../../services/battleService';

class BattleSearch extends Component {
    state = {
        searchInput: '',
        battles: [],
        filteredBattles: []
    }

    componentDidMount(){
        // Get all battles
        battleService.getAllBattles()
        .then(battles => {
            console.log(battles)
            this.setState({
                battles
            })
        })
    }

    filterBattles = searchInput => {
        const { battles } = this.state;
        return battles.filter(battle =>  battle.name.toLowerCase().includes(searchInput.toLowerCase()))
    }

    onChange = e => {
        const searchInput = e.value;
        const filteredBattles = this.filterBattles(searchInput);
        this.setState({
            searchInput,
            filteredBattles
        })
    }

    onClick = battleId => {
        // Go to battle room
    }

    render(){
        return (
            <div className = "BattleSearch">
                <SearchField />
            </div>
        )
    }
}

export default BattleSearch;