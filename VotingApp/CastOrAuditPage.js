import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
} from 'react-native';
var sha = require("./js_voting_crypto/lib/sha2");

var
    HELIOS = require("./js_voting_crypto/lib/helios").HELIOS;

export default class CastOrAuditPage extends Component{

    static navigationOptions = {
        title: 'Голосование',
    };

    _onAuthPressed = () =>{
        let answers = this.props.navigation.state.params.answers;
        let ballot = [];
        for (let i=0; i<answers.length; i++){
            ballot[i] = answers[i].toJSONObject()
        }
        answers = null;
        this.props.navigation.navigate(
            'Authorization', {ballot: ballot,
            election: this.props.navigation.state.params.election});
    };

    _onAuditPressed = () =>{
        const election_json = this.props.navigation.state.params.election;
        const ballot_json = this._getBallotJsonWithPlaintexts(this.props.navigation.state.params.answers);
        this._sendMail("Данные для аудита системы подготовки бюллетеня", JSON.stringify({election: election_json, ballot: ballot_json}));
        this.props.navigation.navigate(
            'ElectionHello', {election: this.props.navigation.state.params.election});
    };

    _getBallotJsonWithPlaintexts = (ballot) =>{
        let ballot_json = [];
        for(let i=0; i<ballot.length; i++){
            ballot_json[i] = ballot[i].toJSONObject(true)
        }
        return ballot_json
    };

    _sendMail = (subject, json) =>{
        Expo.MailComposer.composeAsync({"subject": subject, "body": JSON.stringify(json), "isHtml": false})
    };

    _getBallotHash = (ballot) =>{
        let ballot_json = [];
        for(let i=0; i<ballot.length; i++){
            ballot_json[i]= ballot[i].toJSONObject();
        }
        return sha.hex_sha256(JSON.stringify(ballot_json));
    };

    render() {
        const election_name = this.props.navigation.state.params.election.name;
        const ballot_hash = this._getBallotHash(this.props.navigation.state.params.answers);
        return(
            <View style={styles.container}>
                <Text style={styles.header}>{election_name}</Text>
                <Text style={styles.hash}>sha256 хеш вашего бюллетеня: {ballot_hash}</Text>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onAuthPressed}
                        title='Перейти к авторизации'
                    />
                </View>
                <Text style={styles.instruction}>
                    Для завершения голосования нажмите эту кнопку. Все незашифрованные данные будут стерты после этого шага.
                </Text>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onAuditPressed}
                        title='Проверить подготовку бюллетеня'
                    />
                </View>
                <Text style={styles.instruction}>
                    Для аудита системы подготовки бюллетеня нажмите эту кнопку.
                    Начнется скачивание файла с зашифрованным бюллетенем и доказательством, а вы вернетесь на начальную страницу голосования.
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