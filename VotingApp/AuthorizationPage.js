import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    TextInput
} from 'react-native';

var sha = require("./js_voting_crypto/lib/sha2");

function urlForCast(value) {
    return 'http://172.20.141.126:5000/election/' + value.toString() + '/vote';
}

export default class AuthorizationPage extends Component{

    static navigationOptions = {
        title: 'Авторизация',
    };

    constructor(){
        super();
        this.state = {
            mail: '',
            password: '',
            message: ''
        };
    }

    _onCastPressed = () =>{
        // if ((this.state.mail==='') || (this.state.password==='')){
        //     this.setState({message: 'Введите данные для авторизации'})
        //TODO add function check fields

        let url = urlForCast(this.props.navigation.state.params.election.search_name);
        console.log (url);
        this._executeQuery(url);
    };

    _executeQuery = (url) =>{
        const query_json = JSON.stringify({
            voter: {e_mail: this.state.mail, password: this.state.password},
            ballot: this.props.navigation.state.params.ballot,
            election_id: this.props.navigation.state.params.election.election_id,
            election_hash: sha.hex_sha256(this.props.navigation.state.params.election.toString())
        });
        fetch (url, {method: "POST", headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }, body: query_json})
            .then(res => res.json())
            .then(res => this._handleResponse(res))
    };

    _handleResponse = (res) =>{
        if (res.status === "OK"){
            alert('Ваш голос записан');
            this.props.navigation.navigate('ElectionHello', {election: this.props.navigation.state.params.election});
            this.setState({
                mail: '',
                password: '',
                message: ''
            })
        }
        else{
            this.setState({message: res.description})
        }
    };

    _onMailTextChanged = (event) => {
        this.setState({ mail: event.nativeEvent.text });
    };

    _onPasswordTextChanged = (event) => {
        this.setState({ password: event.nativeEvent.text });
    };


    render() {
        const election_name = 'Тестовые выборы';
        return(
            <View style={styles.container}>

                <Text style={styles.instruction}>Введите e-mail адрес:</Text>
                <TextInput
                    style = {styles.mailInput}
                    keyboardType = 'email-address'
                    underlineColorAndroid={'transparent'}
                    value={this.state.mail}
                    onChange={this._onMailTextChanged}/>
                <Text style={styles.instruction}>Введите пароль:</Text>
                <TextInput
                    style = {styles.mailInput}
                    secureTextEntry={true}
                    underlineColorAndroid={'transparent'}
                    value={this.state.password_hash}
                    onChange={this._onPasswordTextChanged}/>
                <Text style={styles.description}>Если вы прежде отключали сосединение с интернетом, необходимо снова его включить перед нажатием кнопки.</Text>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onCastPressed}
                        title='Проголосовать'
                    />
                </View>
                <Text style={styles.description}>{this.state.message}</Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    header: {
        marginBottom: 30,
        fontSize: 20,
        textAlign: 'center',
        color: '#48BBEC',
    },
    description: {
        marginBottom: 10,
        fontSize: 12,
        textAlign: 'center',
        color: '#858585'
    },
    instruction: {
        // marginTop: 5,
        textAlign: 'left',
        marginBottom: 10,
        fontSize: 16,
        paddingLeft: 20,
        color: '#656565'
    },
    container: {
        padding: 30,
        marginTop: 65,
        // alignItems: 'center'
    },
    someButton: {
        padding: 15,
        marginTop: 20,
        alignSelf: 'center'
    },
    mailInput: {
        marginBottom: 20,
        height: 36,
        padding: 4,
        marginRight: 20,
        marginLeft: 20,
        flexGrow: 1,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#48BBEC',
        color: '#48BBEC',
        borderRadius: 8
    },

});