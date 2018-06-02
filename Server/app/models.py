from app import db
import hashlib
import pickle
import json
from crypto.algs import ElGamal
from crypto.utils import random_string
# from werkzeug.security import generate_password_hash, check_password_hash


class Election(db.Model):
    election_id = db.Column(db.Integer, primary_key=True)
    search_name = db.Column(db.String(64))  # TODO: добавить проверку на единственность
    name = db.Column(db.String(256))
    questions = db.Column(db.PickleType)
    start_datetime = db.Column(db.DateTime)
    end_datetime = db.Column(db.DateTime)
    public_key = db.Column(db.PickleType)
    secret_key = db.Column(db.PickleType)
    election_dict = db.Column(db.PickleType, default=None)
    result = db.Column(db.PickleType, default=None)
    proof = db.Column(db.PickleType, default=None)
    voters = db.Column(db.PickleType, default=None)
    bulletin_list = db.Column(db.PickleType, default=None)
    admin_id = db.Column(db.Integer, default=None)

    voters_table = db.relationship('Voter', backref='voters_info', lazy='dynamic')
    bulletin_board = db.relationship('Board', backref='voters_ballots', lazy='dynamic')

    def __init__(self, election_dict):
        self.search_name = election_dict["search_name"]
        self.name = election_dict["name"]
        self.questions = pickle.dumps(election_dict["questions"])
        self.start_datetime = election_dict["start_datetime"]
        self.end_datetime = election_dict["end_datetime"]

        params = ElGamal.generate(1024)
        keys = params.generate_keypair()
        self.public_key = pickle.dumps(keys.pk.toJSONDict())
        self.secret_key = pickle.dumps(keys.sk.toJSONDict())

    def __repr__(self):
        return '<id {}>'.format(self.election_id)


class Voter(db.Model):
    voter_id = db.Column(db.Integer, primary_key=True)
    election_id = db.Column(db.Integer, db.ForeignKey('election.election_id'))
    e_mail = db.Column(db.String(128))
    name = db.Column(db.String(128))
    voter_identifier = db.Column(db.String(128))
    password = db.Column(db.String(16))

    ballot = db.relationship('Board', backref='voter_ballot', uselist=False)

    def __init__(self, voter_dict, election_id):
        self.election_id = election_id
        self.e_mail = voter_dict["e_mail"]

        if voter_dict["name"]:
            self.name = voter_dict["name"]
        else:
            self.name = None

        if voter_dict["voter_identifier"]:
            self.voter_identifier = voter_dict["voter_identifier"]
        elif self.name:
            self.voter_identifier = self.name
        else:
            self.voter_identifier = self.e_mail

        if voter_dict["password"]:
            self.password = voter_dict["password"]
        else:
            self.password = random_string(16)

    def __repr__(self):
        return '<id {}>'.format(self.voter_id)


class Board(db.Model):
    ballot_id = db.Column(db.Integer, primary_key=True)
    election_id = db.Column(db.Integer, db.ForeignKey('election.election_id'))
    voter_id = db.Column(db.Integer, db.ForeignKey('voter.voter_id'))
    voter_identifier = db.Column(db.String(128))
    ballot_dict = db.Column(db.PickleType)
    ballot_hash = db.Column(db.String(256))

    def __init__(self, election_id, voter_id, voter_identifier, ballot_dict):
        self.election_id = election_id
        self.voter_id = voter_id
        self.voter_identifier = voter_identifier
        self.ballot_dict = pickle.dumps(ballot_dict)
        self.ballot_hash = hashlib.sha256(json.dumps(ballot_dict).encode('utf-8')).hexdigest()

    def __repr__(self):
        return '<id {}>'.format(self.ballot_id)

    # def set_password(self, password):
    #     self.password_hash = generate_password_hash(password)
    #
    # def check_password(self, password):
    #     return check_password_hash(self.password_hash, password)

#
# class Option(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     voting_id = db.Column(db.Integer, db.ForeignKey('voting.id'), nullable=False)
#     text = db.Column(db.String(256), nullable=False)
#
#     def __init__(self, voting_id, text):
#         self.voting_id = voting_id
#         self.text = text
#
#     def __repr__(self):
#         return '<id {}>'.format(self.id)
#
#

#

