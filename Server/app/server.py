from app import app
from flask import jsonify, json, abort, make_response, request
from app.models import Election, Voter, Board
import json
import pickle
from app import electionutils
from app import db


@app.route('/election/<string:search_name>', methods=['GET'])
def get_election_headers(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found
    response_dict = {
        "election_id": election.election_id,
        "search_name": election.search_name,
        "name": election.name,
        "start_datetime": election.start_datetime,
        "end_datetime": election.end_datetime
    }
    return jsonify({"election_headers": response_dict})


@app.route('/election/<string:search_name>/vote', methods=['GET'])
def get_election_json(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found('Такого голосования нет')
    return jsonify({"election": pickle.loads(election.election_dict)})


@app.route('/election/<string:search_name>/vote', methods=['POST'])
def cast_vote(search_name):
    if not request.json or (not ('voter' in request.json) and not ('ballot' in request.json) and not ('election_id' in request.json)):
        return bad_request('Не все заголовки')
    # Проверка существования такого голосования
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found('Такого голосования нет')
    # Проверка доступа
    voter = Voter.query.filter_by(election_id=election.election_id).filter_by(e_mail=request.json['voter']['e_mail']).first()
    if not voter:
        return unauthorized('Неверный e-mail адрес')
    if not voter.password == request.json['voter']['password']:
        return unauthorized('Неверный пароль')
    # Проверка, существует ли уже бюллетень от этого пользователя
    old_ballot = Board.query.filter_by(election_id=election.election_id).filter_by(voter_id=voter.voter_id).first()
    if not (old_ballot is None):
        db.session.delete(old_ballot)
    # Добавление бюллетеня
    ballot = Board(election_id=election.election_id, voter_id=voter.voter_id,
                   voter_identifier=voter.voter_identifier, ballot_dict=request.json['ballot'])
    db.session.add(ballot)
    db.session.commit()
    return make_response(jsonify({'status': 'OK'}), 200)


@app.route('/election/<string:search_name>/board', methods=['GET'])
def get_board(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found
    board = Board.query.filter_by(election_id=election.election_id).all()
    board_dict = []
    for ballot in board:
        board_dict.append({"voter_identifier": ballot.voter_identifier,
                           "ballot_hash": ballot.ballot_hash,
                           "voter_id": ballot.voter_id,
                           "ballot_dict": pickle.loads(ballot.ballot_dict)})
    return jsonify(board_dict)


@app.route('/election/<string:search_name>/result', methods=['GET'])
def get_result(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found
    board = Board.query.filter_by(election_id=election.election_id).all()
    return jsonify({'result': pickle.loads(election.result), 'ballot_num': len(board)})


@app.route('/election/<string:search_name>/proof', methods=['GET'])
def get_proof(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    if election is None:
        return not_found
    return jsonify(pickle.loads(election.proof))


@app.route('/test', methods=['POST'])
def test_electionutils():
    # election_dict = {
    #     "search_name": "test-election",
    #     "name": "Тестовое голосование.",
    #     "questions": [{"question": "Какой кот лучше?", "answers": ["рыжий", "пушистый", "свой"], "min": 1, "max": 1},
    #                   {"question": "Что делать после написания диплома?",
    #                    "answers": ["пить", "спать", "смотреть мультики", "искать работу", "жить"],
    #                    "min": 0, "max": 3}],
    #     "start_datetime": None,
    #     "end_datetime": None
    # }
    # message = electionutils.election_init(election_dict)
    election_id = electionutils.get_election_id("test-election")
    # voters_list = [{"e_mail": "anna@example.com", "password": "123", "name": "Анна", "voter_identifier": "anna"},
    #                {"e_mail": "bogdan@example.com", "password": "123", "name": "Богдан", "voter_identifier": "bogdan"},
    #                {"e_mail": "veronika@example.com", "password": "123", "name": "Вероника", "voter_identifier": "veronika"}]
    # message = electionutils.add_voters_list(voters_list, election_id)
    # message = electionutils.election_froze(election_id)
    electionutils.create_result_and_proof(1)

    return "OK"


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'status': 'error', 'error': error}), 404)
    # return make_response(jsonify({'error': 'Not found'}), 404)

@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'status': 'error', 'error': 'Bad request',
                                  'description': error}), 400)

@app.errorhandler(401)
def unauthorized(error):
    return make_response(jsonify({'status': 'error', 'error': 'Unauthorized',
                                  'description': error}), 401)

if __name__ == '__main__':
    app.run(debug=True)


