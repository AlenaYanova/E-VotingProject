import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Button,
    ActivityIndicator
} from 'react-native';

import SectionedMultiSelect from './list_component/lib/sectioned-multi-select';

var
    rng = require("./js_voting_crypto/lib/rng"),
    HELIOS = require("./js_voting_crypto/lib/helios").HELIOS;

var random = new rng.RNG();
random.autoseed();

export default class BulletinPage extends Component {

    static navigationOptions = {
        title: 'Бюллетень'
    };

    constructor() {
        super();
        this.state = {
            selectedItems: [],
            message: ""
        }
    }

    _onSelectedItemsChange = (selectedItems) => {
        this.setState({selectedItems});
    };

    _onConfirmPressed = () => {
        const answers = this._parsedAnswers();
        const start = this._checkAnswers(answers);
        if (start===true) {
            this._createCipherText(answers);
        }
    };

    _createCipherText = (answers) => {
        const election = HELIOS.Election.fromJSONObject(this.props.navigation.state.params.election);
        let encrypted_answers = [];
        for (let i=0; i<answers.length; i++){
            let answer = [];
            for (let j=0; j<answers[i].length; j++)
                if (answers[i][j]===1) answer.push(j);
            let ea = new HELIOS.EncryptedAnswer(election.questions[i], answer, election.public_key);
            encrypted_answers.push(ea)
        }
        this._navigateToNext(encrypted_answers)
    };

    _navigateToNext(encrypted_answers){
        this.props.navigation.navigate(
            'CastOrAudit', {answers: encrypted_answers,
            election: this.props.navigation.state.params.election});
    }

    _checkAnswers = (answers) => {
        let questions = this.props.navigation.state.params.election.questions;
        let message = "Проверьте: ";
        let res = true;
        for (let i=0; i<answers.length; i++){
            let choose_num = answers[i].reduce(function(a, b) {
                return a + b;
            });
            if ((questions[i].min > choose_num) || (questions[i].max < choose_num)){
                res = false;
                message += "вопрос " + (i+1).toString() + ", ";
            }
        }
        if (res === false)
            this.setState({message: message.substr(0, message.length-2)});
        else
            this.setState({message: ""});
        return res;
    };

    _parsedAnswers = () => {
        let answers = this.state.selectedItems;
        let parsed_answers = [];
        // initialisation
        let questions = this.props.navigation.state.params.election.questions;
        for (let i=0; i< questions.length; i++){
            parsed_answers[i] = [];
             for (let j=0; j<questions[i].answers.length; j++)
                 parsed_answers[i][j] = 0;
        }
        // parse
        for (let i=0; i<answers.length; i++){
            let answer = answers[i].toString();
            let question = parseInt(answer[0])-1, point = parseInt(answer.substr(1));
            parsed_answers[question][point]=1;
        }
        return parsed_answers;
    };

    _parsedQuestions = (questions) => {
        let parsed_questions = [];
        for (let i=0; i< questions.length; i++){
            let parsed_question={
                name: "Вопрос " + (i+1).toString() + ". " + questions[i].question,
                id: i,
                children: []
            };
            for (let j=0; j<questions[i].answers.length; j++){
                parsed_question.children[j] = {
                    name: questions[i].answers[j],
                    id: parseInt((i+1).toString() + j.toString())
                };
            }
            parsed_questions[i] = parsed_question;
        }
        return parsed_questions;
    };

    _getInstruction = (questions) => {
        let instructions = "";
        for (let i=0; i< questions.length; i++) {
            let instruction = "Вопрос " + (i+1).toString() + ": ";
            let min = questions[i].min;
            let max = questions[i].max;
            if (min===max)
                instruction+=min.toString();
            else
                instruction+=min.toString()+"-"+max.toString();
            instructions+=instruction + "\n";
        }
        return instructions;
    };

    render() {
        const election = this.props.navigation.state.params.election;
        const questions = this._parsedQuestions(election.questions);
        const election_name = election.name;
        const instruction = this._getInstruction(election.questions);

        return (
            <View>
                <SectionedMultiSelect
                    items={questions}
                    uniqueKey='id'
                    subKey='children'
                    selectText={election_name}
                    showDropDowns={false}
                    readOnlyHeadings={true}
                    hideSearch={true}
                    onSelectedItemsChange={this._onSelectedItemsChange}
                    selectedItems={this.state.selectedItems}
                />

                <View style={styles.container}>
                    <Text style={styles.instruction}>Обратите внимание, что в каждом из предложенных вопросов необходимо
                        отметить следующее количество пунктов.</Text>
                    <Text style={styles.instruction}>{instruction}</Text>
                </View>

                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onConfirmPressed}
                        title='Подтвердить выбор'
                    />

                </View>
                <Text style={styles.instruction}>{this.state.message}</Text>

            </View>


        );
    }
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 40,
        fontSize: 20,
        textAlign: 'center',
        color: '#2e2e2e'
    },
    description: {
        marginBottom: 10,
        fontSize: 16,
        textAlign: 'center',
        color: '#656565'
    },
    instruction: {
        // marginTop: 5,
        marginBottom: 5,
        fontSize: 12,
        textAlign: 'center',
        color: '#858585'
    },
    container: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        alignItems: 'center'
    },
    someButton: {
        alignSelf: 'center'
    }

});