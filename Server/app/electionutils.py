from app.models import Election, Voter, Board
from app import db
import pickle
import json
from datetime import datetime
from crypto import utils
from crypto import algs, electionalgs
import hashlib


# найти id голосования по search_name (search_name): вернуть json co статусом True/False и значением id
def get_election_id(search_name):
    election = Election.query.filter_by(search_name=search_name).first()
    return election.election_id

# Этап подготовки к голосованию (пока без всякой заморозки и возможности изменения данных):
# инициализировать голосование (json без ключей, хеша, id, хеша избирателей) - частично реализовать в бд, возвращает сообщение "ОК" или строку с ошибкой
def election_init(election_dict):
    # TODO проверить, что в этом файле есть все, что нужно
    new_election = Election(election_dict=election_dict)
    if new_election is None:
        return "wrong json"
    db.session.add(new_election)
    db.session.commit()
    # added_election = Election.query.filter_by(search_name=election_dict["search_name"]).first()
    # new_dict = pickle.loads(added_election.election_dict)
    # new_dict.update({"election_id": added_election.election_id})
    # new_dict.update({"public_key": pickle.loads(added_election.public_key)})
    # added_election.election_dict = new_dict
    # db.session.add(added_election)
    # db.session.commit()
    return "OK"

def election_froze(election_id):
    election = Election.query.filter_by(election_id=election_id).first()
    if election is None:
        return "wrong id"
    election_dict = {
        "election_id": election.election_id,
        "search_name": election.search_name,
        "name": election.name,
        "public_key": pickle.loads(election.public_key),
        "questions": pickle.loads(election.questions),
        "voters_hash": None,
        "start_datetime": election.start_datetime,
        "end_datetime": election.end_datetime
    }
    election.election_dict = pickle.dumps(election_dict)
    db.session.add(election)
    db.session.commit()
    return "OK"

# добавить избирателей (id голосования, json со всеми данными кроме id и пароля) - частично реализовать в бд, не забыть проверить голосование на валидность (а потом и добавляющего)
def add_voters_list(voters_list, election_id):
    for voter in voters_list:
        # TODO проверить, что в словаре voter есть 'e_mail'
        new_voter = Voter(voter_dict=voter, election_id=election_id)
        if new_voter is None:
            return "Not valid voter_dict or election_id"
        db.session.add(new_voter)
    db.session.commit()
    return "OK"


def create_result_and_proof(election_id):
    whole_election = Election.query.filter_by(election_id=election_id).first()
    election = electionalgs.Election.fromJSONDict(pickle.loads(whole_election.election_dict))
    # print(election.pk.p)
    sk = algs.EGSecretKey.fromJSONDict(pickle.loads(whole_election.secret_key))
    # board = Board.query.filter_by(election_id=election_id).first()
    # print((pickle.loads(board.ballot_dict))[0]['choices'])
    # print(whole_election.questions)
    board = Board.query.filter_by(election_id=election_id).all()
    # result = []
    # proof = []
    # for i in range(len(pickle.loads(whole_election.questions))):
    tally = election.init_tally()
    for whole_ballot in board:
        answers = (pickle.loads(whole_ballot.ballot_dict))
        # print(answers)
        ballot = electionalgs.EncryptedVote.fromJSONDict({'answers': answers,
                                                          'election_hash': hashlib.sha256(str(pickle.loads(whole_election.election_dict)).encode('utf-8')).hexdigest(),
                                                          'election_id': whole_election.election_id})
        tally.add_vote(ballot)
    result, proof = tally.decrypt_and_prove(sk)
    whole_election.result = pickle.dumps(result)
    whole_election.proof = pickle.dumps(proof)
    db.session.add(whole_election)
    db.session.commit()



# Этап голосования:
# начать голосование (id) все, что делает - это вычисляет хеш от избирателей и записывает json с ними в бд, но вообще должна еще рассылать письма, возвращает true или false
# добавить голос (данные о бюллетене) проверяет данные аутентификации, если все не ок - возвращает строку с ошибкой,
#   удаляет предыдущий голос из бд, если он существует и добавляет новый, возвращает "OK"

# получить доску бюллетеней (search_name/id) возвращает json из индетификаторов и хешей
#   (сначала проверяет наличие файла в основной таблице, и только потом в таблице с досками), возвращает json из статуса и результата

# После голосования:
# завершить голосование (id) выполняется, только если время действительно истекло
# собирает все данные с доски и считает результат с док-вом, записывает в бд
# делает json файлы со списком избирателей и доской бюллетеней, удаляет эти данные из бд
# удаляет секретный ключ и (?)
# возвращает true (?)
