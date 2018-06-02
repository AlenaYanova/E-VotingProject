import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Button,
} from 'react-native';

import "./globals";

function urlForQuery(key, value) {
    return 'http://172.20.141.126:5000/election/' + value.toString() + '/vote';
}

function urlForGettingResult(value) {
    return 'http://172.20.141.126:5000/election/' + value.toString() + '/result';
}

export default class SearchPage extends Component{

    static navigationOptions = {
        title: 'Поиск голосования',
    };

    constructor(props) {
        super(props);
        this.state = {
            searchString: '',
            isLoading: false,
            message: '',
        };
    }

    _onSearchTextChanged = (event) => {
        this.setState({ searchString: event.nativeEvent.text });
    };

    _executeQuery = (query) => {
        console.log(query);
        this.setState({ isLoading: true });
        fetch(query, {method: "GET"})
            .then(response => response.json())
            .then(response => this._handleResponse(response))
            .catch(error =>
                this.setState({
                    isLoading: false,
                    message: 'Что-то пошло не так ' + error
                }));
    };

    _handleResponse = (response) => {
        // TODO date check
        this.setState({ isLoading: false , message: '' });
        if (response.error)
            this.setState({ isLoading: false , message: response.error });
        else {
            if((response.election.start_datetime == null) || (response.election.end_datetime == null)) {
                // this._navigateToStart(response.election);
                this._navigateToResult(response.election);
            }
            else {
                const start = response.election.start_datetime;
                const end = response.election.end_datetime;
                console.log(Date.parse(start) - Date.now());
                console.log(Date.now() - Date.parse(end));
            }
        }
        // this.props.navigation.navigate(
        //     'Voting', {voting: response, id: this.state.searchString});
        // console.log(response)
    };

    _navigateToStart = (election_json) => {
        this.props.navigation.navigate(
            'ElectionHello', {election: election_json});
    };

    _navigateToResult = (election_json) => {
        fetch(urlForGettingResult(this.state.searchString), {method: "GET"})
            .then(result => result.json())
            .then(result => this.props.navigation.navigate('Result', {election: election_json, result: result}))
    };

    _onSearchPressed = () => {
        const query = urlForQuery('voting_id', this.state.searchString);
        this._executeQuery(query);
    };


    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.description}>
                    Введите идетификатор* голосования:
                </Text>
                <Text style={styles.instruction}>
                    *идетификатор - это строка на английском без пробелов
                </Text>
                <View style={styles.flowRight}>
                    <TextInput
                        underlineColorAndroid={'transparent'}
                        style={styles.searchInput}
                        value={this.state.searchString}
                        onChange={this._onSearchTextChanged}/>
                    <Button
                        onPress={this._onSearchPressed}
                        color='#48BBEC'
                        title='Найти'
                    />
                </View>
                <Text style={styles.description}>{this.state.message}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    description: {
        marginBottom: 20,
        fontSize: 20,
        textAlign: 'center',
        color: '#2E2E2E'
    },
    instruction: {
        marginBottom: 20,
        fontSize: 12,
        textAlign: 'center',
        color: '#656565'
    },
    container: {
        padding: 30,
        marginTop: 65,
        alignItems: 'center'
    },
    flowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    searchInput: {
        height: 36,
        padding: 4,
        marginRight: 5,
        flexGrow: 1,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#48BBEC',
        borderRadius: 8,
        color: '#48BBEC',
    },
});