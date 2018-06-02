import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    TextInput,
    TouchableWithoutFeedback,
    Button,
    ScrollView,
    Alert
} from 'react-native';

import { RadioButtons } from 'react-native-radio-buttons';
//
// var ElGamal = require('./js_voting_crypto/lib/elgamal').ElGamal;
// import ElGamal from 'js_voting_crypto'

// var
//     BigInt = require('./js_voting_crypto/lib/bigint').BigInt,
//     ElGamal = require("./js_voting_crypto/lib/elgamal").ElGamal,
//     rng = require("./js_voting_crypto/lib/rng");

export default class VotingBox extends Component{
    static navigationOptions = {
        title: 'Голосование'
    };

    constructor(){
        super();
        this.state = {
            optionText: '',
            optionId: '',
            mail: "",
            message: ''
        };
    }

    CreateVoteJson() {
        let json = JSON.stringify({"optionId": this.state.optionId, "e-mail": this.state.mail});
        return json;
    }

    CipherVote(plaintext, public_key) {
        const PARAMS = {
            p: new BigInt(public_key.p, 10),
            q: new BigInt(public_key.q, 10),
            g: new BigInt(public_key.g, 10)
        };
        const params = new ElGamal.Params(PARAMS.p,PARAMS.q, PARAMS.g);
        const keypair = params.generate();
        console.log(keypair);
    }

    urlForQuery() {
        return 'http://172.20.222.45:5000/vote/' + this.props.navigation.state.params.id.toString();
    }

    _onMailTextChanged = (event) => {
        this.setState({ mail: event.nativeEvent.text });
    };

    _onVotePressed = () => {
        if (this.state.optionId === '')
            this.setState({
                message: 'Опция не выбрана.'
            });
        else if (this.state.mail === '')
            this.setState({
                message: 'E-mail не введен.'
            });
        else {
            // this._executeQuery()
            const voting = JSON.parse(this.props.navigation.state.params.voting);
            this.CipherVote(this.state.optionId, voting.publicKey)
        }

    };
    //
    // _executeQuery = () => {
    //     fetch(this.urlForQuery(),
    //         {
    //             method: 'post',
    //             headers: {
    //                 'Accept': 'application/json, text/plain, */*',
    //                 'Content-Type': 'application/json'
    //             },
    //             body: this.CreateVoteJson()
    //         });
    //     Alert.alert('','Ваш голос успешно записан!');
    // };

    render(){
        // TODO: add e-mail check
        // TODO: add scroll view
        // TODO: add answer after 'vote' button
        const voting = JSON.parse(this.props.navigation.state.params.voting);
        console.log(voting);
        const optionsText = voting.votingOptions.map( option => option.text);
        const optionsId = voting.votingOptions.map( option => option.id);
        const votingName = voting.votingName;

        function setSelectedOption(selectedOption){
            optionsText.forEach((item, i) => {
                if (item === selectedOption)
                    this.setState({
                        optionId: optionsId[i]
                    })
            });
            this.setState({
                optionText: selectedOption
            });
        }

        function renderOption(option, selected, onSelect, index){

            const textStyle = {
                paddingTop: 10,
                paddingBottom: 10,
                color: '#656565',
                flex: 1,
                fontSize: 14,
            };
            const baseStyle = {
                flexDirection: 'row',
            };
            let style;
            let checkMark;

            if (index > 0) {
                style = [baseStyle, {
                    borderTopColor: '#eeeeee',
                    borderTopWidth: 1,
                }];
            } else {
                style = baseStyle;
            }

            if (selected) {
                checkMark = <Text style={styles.checkMark}>✓</Text>;
            }

            return (
                <TouchableWithoutFeedback onPress={onSelect} key={index}>
                    <View style={style}>
                        <Text style={textStyle}>{option}</Text>
                        {checkMark}
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        function renderContainer(options){
            return (
                <View style={styles.container}>
                    {options}
                </View>
            );
        }

        return (
            <View style={styles.baseView}>
                <Text style={styles.votingHeader}>{votingName}</Text>

                <View style={styles.optView}>
                    <Text style={styles.helpText}>Сделайте свой выбор:</Text>
                    <RadioButtons
                        options={ optionsText }
                        onSelection={ setSelectedOption.bind(this) }
                        selectedOption={ this.state.optionText }
                        renderOption={ renderOption }
                        renderContainer={ renderContainer }
                    />
                    <Text style={styles.helpText}>Введите e-mail:</Text>
                    <TextInput
                        style = {styles.mailInput}
                        underlineColorAndroid={'transparent'}
                        value={this.state.mail}
                        onChange={this._onMailTextChanged}/>
                </View>
                <View style={styles.voteButton}>
                <Button
                    color='#48BBEC'
                    onPress={this._onVotePressed}
                    title='Проголосовать'
                />
                </View>
                <Text style={styles.message}>{this.state.message}</Text>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,
        borderTopColor: '#48BBEC',
        borderBottomWidth: 1,
        borderBottomColor: '#48BBEC',
    },
    baseView: {
        flex: 1,
        marginTop: 10,
    },
    checkMark: {
        flex: 0.1,
        color: '#48BBEC',
        fontWeight: 'bold',
        paddingTop: 8,
        fontSize: 20,
        alignSelf: 'center',
    },
    helpText:{
        color: '#656565',
        paddingLeft: 20,
        marginBottom: 5,
        marginTop: 15,
        fontSize: 16,
    },
    optView: {
        paddingTop: 5,
        paddingBottom: 5,
    },
    votingHeader: {
        color: '#656565',
        padding: 15,
        textAlign: 'center',
        fontSize: 20
    },
    message: {
        color: '#656565',
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
    voteButton: {

        alignSelf: 'center'
    }

});

