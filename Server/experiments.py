# from cryptography.elgamal import elgamal
import hashlib
import pickle

# keys = elgamal.generate_keys()
# tmp1 = pickle.dumps(keys['publicKey'])
# print(tmp1)
# tmp2 = pickle.loads(tmp1)
# print(tmp2.p)

print(hashlib.sha256('3ee3'.encode('utf-8')).hexdigest())
# cipher = elgamal.encrypt(keys['publicKey'], "This is the message I want to encrypt")
# print (cipher)
# sha = hashlib.sha1(cipher.encode('utf-8')).hexdigest()
# print(sha)
# plaintext = elgamal.decrypt(keys['privateKey'], cipher)
# print (plaintext)
