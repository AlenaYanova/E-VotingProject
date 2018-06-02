import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
} from 'react-native';
var sha = require("./js_voting_crypto/lib/sha2");

function urlForBoardQuery(value){
    return 'http://172.20.141.126:5000/election/' + value.toString() + '/board';
}

export default class ElectionStartPage extends Component{

    static navigationOptions = {
        title: 'Голосование. Начальная страница',
    };

    _onStartPressed = () =>{
        this.props.navigation.navigate(
            'Bulletin', {election: this.props.navigation.state.params.election});
    };

    _onBoardPressed = () =>{
        const url = urlForBoardQuery(this.props.navigation.state.params.election.search_name);
        fetch(url, {method: "GET"})
            .then(response => response.json())
            .then(response => this.props.navigation.navigate(
                'Board', {election: this.props.navigation.state.params.election, board: response}))
            // .catch(error =>
            //     this.setState({
            //         isLoading: false,
            //         message: 'Что-то пошло не так ' + error
            //     }));
    };

    render() {
        const election = this.props.navigation.state.params.election;
        const election_name = election.name;
        const election_hash = sha.hex_sha256(JSON.stringify(election));
        return(
            <View style={styles.container}>
                <Text style={styles.description}>
                    Добро пожаловать в голосование
                </Text>
                <Text style={styles.header}>{election_name}</Text>
                <Text style={styles.hash}>sha256 хеш: {election_hash}</Text>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onStartPressed}
                        title='Начать голосование'
                    />
                </View>
                <Text style={styles.instruction}>
                    Если вы впервые на этой странице, рекомендуем нажать эту кнопку. После выбора этого шага вы можете отключить соединение с интернетом.
                </Text>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onBoardPressed}
                        title='Открыть доску объявлений'
                    />
                </View>
                <Text style={styles.instruction}>
                    Нажмите на эту кнопку, чтобы просмотреть доску объявлений голосования "{election_name}".
                </Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
        fontSize: 20,
        textAlign: 'center',
        color: '#2e2e2e'
    },
    hash: {
        marginBottom: 20,
        fontSize: 12,
        textAlign: 'center',
        color: '#48BBEC',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderBottomColor: '#48BBEC',
        borderTopColor: '#48BBEC'
    },
    description: {
        marginBottom: 10,
        fontSize: 16,
        textAlign: 'center',
        color: '#656565'
    },
    instruction: {
        // marginTop: 5,
        marginBottom: 30,
        fontSize: 12,
        textAlign: 'center',
        color: '#858585'
    },
    container: {
        padding: 30,
        marginTop: 65,
        alignItems: 'center'
    },
    someButton: {
        padding: 15,
        marginTop: 20,
        alignSelf: 'center'
    }

});