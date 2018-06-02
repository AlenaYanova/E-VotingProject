import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    Button,
    SectionList,
    TextInput
} from 'react-native';

function urlForGettingProof(value) {
    return 'http://172.20.141.126:5000/election/' + value.toString() + '/proof';
}

export default class ResultPage extends Component{

    static navigationOptions = {
        title: 'Результаты'
    };


    _onLoadPressed = () => {
        // TODO check, that text in field is e-mail
        const url = urlForGettingProof(this.props.navigation.state.params.election.search_name);
        fetch(url, {method: "GET"})
            .then(proof => proof.json())
            .then(proof => this._sendMail("Доказательство честности голосования", proof));

    };

    _sendMail = (subject, json) =>{
        Expo.MailComposer.composeAsync({"subject": subject, "body": JSON.stringify(json), "isHtml": false})
    };

    _parseResult = (questions, result) => {
        let parsed_result = [];
        for (let i=0; i< questions.length; i++){
            let data = [];
            for (let j=0; j<questions[i].answers.length; j++)
                data.push(questions[i].answers[j].toString() + ' - ' + result[i][j].toString());
            parsed_result.push({title: 'Вопрос ' + (i+1).toString() + '. ' + questions[i].question, data: data})
        }
        return parsed_result;
    };


    render() {
        const result = this._parseResult(this.props.navigation.state.params.election.questions, this.props.navigation.state.params.result.result);

        const election_name = this.props.navigation.state.params.election.name;
        const ballot_num = this.props.navigation.state.params.result.ballot_num;

        return(
            <View>
            <View style={[{
                marginHorizontal: 18,
                marginVertical: 26,
                borderRadius: 6,
                padding: 10,
                backgroundColor: 'white'}]}
            >
                <Text style={[{
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#48BBEC',
                    paddingBottom: 5
                }]}>{election_name}</Text>

                <Text style={[{
                    fontSize: 16,
                    textAlign: 'center',
                    color: '#848787',
                    paddingBottom: 5
                }]}>Число поданных бюллетеней: {ballot_num}</Text>

                <SectionList
                    renderItem={({item, index, section}) => <Text key={index} style={({color: '#848787', fontSize: 14, paddingVertical: 5})}>{item}</Text>}
                    renderSectionHeader={({section: {title}}) => (
                        <Text style={{fontWeight: 'bold', paddingVertical:5, fontSize:16, color: '#2e2e2e'}}>{title}</Text>
                    )}
                    sections={result}
                    keyExtractor={(item, index) => item + index}
                />
            </View>

                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onLoadPressed}
                        title='Скачать доказательство'
                    />
                </View>

            </View>
        )
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