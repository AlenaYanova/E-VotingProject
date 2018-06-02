import React, { Component } from "react";
import { StyleSheet, Text, View, TextInput, FlatList, Button } from "react-native";
import PropTypes from "prop-types";

var sha = require("./js_voting_crypto/lib/sha2");

const data = [
    { id: 1, name: "Francesco Raoux" },
    { id: 2, name: "Tasha Bonanno" },
    { id: 3, name: "Merle Braunstein" },
    { id: 4, name: "Aleda Bouzan" },
    { id: 5, name: "Issiah Elnaugh" }
];


class SearchableFlatlist extends Component {
    static INCLUDES = "includes";
    static WORDS = "words";
    getFilteredResults() {
        let { data, type, searchProperty, searchTerm } = this.props;
        return data.filter(
            item =>
                type && type === SearchableFlatlist.WORDS
                    ? new RegExp(`\\b${searchTerm}`, "gi").test(item[searchProperty])
                    : new RegExp(`${searchTerm}`, "gi").test(item[searchProperty])
        );
    }
    render() {
        return <FlatList {...this.props} data={this.getFilteredResults()} />;
    }
}

SearchableFlatlist.propTypes = {
    data: PropTypes.array.isRequired,
    searchProperty: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    type: PropTypes.string
};

export default class BoardPage extends Component {

    static navigationOptions = {
        title: 'Доска объявлений'
    };

    state = { searchTerm: "" };

    _onLoadPressed = () =>{
        const board = this.props.navigation.state.params.board;
        this._sendMail("Данные с доски объявлений", board);
    };

    _sendMail = (subject, json) =>{
        Expo.MailComposer.composeAsync({"subject": subject, "body": JSON.stringify(json), "isHtml": false})
    };

    _parseBoard = (board) =>{
        let parse_board=[];
        for (let i=0; i<board.length; i++){
            parse_board[i] = {
                id: board[i].voter_id,
                voter_identifier: board[i].voter_identifier,
                ballot_hash: sha.hex_sha256(JSON.stringify(board[i].ballot_dict))
            }
        }
        return parse_board
    };

    render() {
        const election = this.props.navigation.state.params.election;
        const board = this.props.navigation.state.params.board;
        // console.log(board);
        const parse_board = this._parseBoard(board);
        // console.log((parse_board));
        const election_name = election.name;
        const election_hash = sha.hex_sha256(JSON.stringify(election));

        let { sContainer, sSearchBar, sTextItem, flowRight, hash} = styles;
        return (
            <View>
            <View style={sContainer}>
                <Text style={styles.header}>{election_name}</Text>
                <Text style={styles.elhash}>sha256 хеш: {election_hash}</Text>
                <TextInput
                    placeholder={"Поиск"}
                    style={sSearchBar}
                    onChangeText={searchTerm => this.setState({ searchTerm })}
                />
                <SearchableFlatlist
                    searchProperty={"voter_identifier"}
                    searchTerm={this.state.searchTerm}
                    data={parse_board}
                    containerStyle={{ flex: 1 }}
                    renderItem={({ item }) => (
                        <View styles={flowRight}>

                        <Text style={sTextItem}>{item.voter_identifier}:</Text>
                        <Text style={hash}>{item.ballot_hash}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                />
            </View>
                <View style={styles.someButton}>
                    <Button
                        color='#48BBEC'
                        onPress={this._onLoadPressed}
                        title='Скачать полную информацию о бюллетенях'
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sContainer: {
        marginHorizontal: 18,
        marginVertical: 26,
        borderRadius: 6,
        padding: 10,
        backgroundColor: 'white'
    },
    sTextItem: {
        height: 50,
        textAlign: "left",
        textAlignVertical: "center",
        fontSize: 16,
        color: '#48BBEC'
    },
    hash: {
        height: 50,
        textAlign: "left",
        textAlignVertical: "center",
        color: '#858585',
        fontSize: 14
    },
    sSearchBar: {
        height: 36,
        padding: 4,
        // flex:1,
        // marginRight: 5,
        // flexGrow: 1,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#48BBEC',
        borderRadius: 8,
        color: '#48BBEC'
    },
    flowRight: {
        marginHorizontal: 15,
        // flexDirection: 'row',
        // alignItems: 'center',
        borderBottomColor: "#48BBEC",
        borderBottomWidth: 1
        // alignSelf: 'stretch',
    },
    header: {
        marginBottom: 20,
        fontSize: 20,
        textAlign: 'center',
        color: '#2e2e2e'
    },
    elhash: {
        marginBottom: 20,
        fontSize: 12,
        textAlign: 'center',
        color: '#48BBEC',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderBottomColor: '#48BBEC',
        borderTopColor: '#48BBEC'
    },
    someButton: {
        flexGrow:1,
        paddingHorizontal: 30,
        marginTop: 30,
        alignSelf: 'center'
    }
});