import React, { Component } from 'react';

import axios from 'axios';

import './BattleSearch.css';
import SearchField from './SearchField';
import SearchResults from './SearchResults';

class BattleSearch extends Component {
    state = {
        searchInput: '',
        battles: []
    }

    componentDidMount(){
        axios.get('/api/battles')
        .then(res => {
            const battles = res.data;
            this.setState({ battles })
        })       
    }

    filterBattles = (battles, searchInput) => {
        return battles.filter(battle =>  battle.name.toLowerCase().includes(searchInput.toLowerCase()))
    }

    onChange = e => {
        const searchInput = e.target.value;
        this.setState({
            searchInput,
        })
    }

    onClick = battleId => {
        const { battles } = this.state;
        // Go to battle room
        this.setState({
            searchInput: battles.filter(battle => battle._id === battleId)[0]?.name
        })
    }

    render(){
        const { battles, searchInput } = this.state;
        return (
            <div className = "BattleSearch">
                <h5>Search for a Battle</h5>
                { searchInput.length >= 3 ? (
                    <SearchResults 
                        onClick = { this.onClick.bind(this) }
                        battles = { this.filterBattles(battles, searchInput) }  
                    />
                ) : null }
                <SearchField 
                    searchInput = { searchInput }
                    onChange = { this.onChange.bind(this) }
                />
            </div>
        )
    }
}

export default BattleSearch;