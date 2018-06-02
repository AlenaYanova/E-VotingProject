"""
Utilities.

Ben Adida - ben@adida.net
2005-04-11
"""

import urllib.request, urllib.parse, urllib.error, re, sys, datetime, urllib.parse, string
import threading
#
# from django.utils import simplejson
#
# from django.conf import settings
  
import random, logging
import hashlib, hmac, base64
import json

def hash(s):
  """
  hash the string using sha1
  """
  return hashlib.sha1.hexdigest(s)

def hash_b64(s):
  """
  hash the string using sha256 and produce a base64 output
  removes the trailing "="
  """
  # FIXME add base64 output
  # result= base64.b64encode(hashlib.sha1.digest(s))[:-1]
  # result = base64.b64encode((hashlib.sha1(s.encode('utf-8'))).digest())
  result = hashlib.sha256(s.encode('utf-8')).hexdigest()
  return result

# def do_hmac(k,s):
#   """
#   HMAC a value with a key, hex output
#   """
#   mac = hmac.new(k, s, sha)
#   return mac.hexdigest()

#
# def split_by_length(str, length, rejoin_with=None):
#   """
#   split a string by a given length
#   """
#   str_arr = []
#   counter = 0
#   while counter < len(str):
#     str_arr.append(str[counter:counter+length])
#     counter += length
#
#   if rejoin_with:
#     return rejoin_with.join(str_arr)
#   else:
#     return str_arr
#

# def urlencode(str):
#     """
#     URL encode
#     """
#     if not str:
#         return ""
#
#     return urllib.parse.quote(str)
#
# def urlencodeall(str):
#     """
#     URL encode everything even unresreved chars
#     """
#     if not str:
#         return ""
#
#     return string.join(['%' + s.encode('hex') for s in str], '')
#
# def urldecode(str):
#     if not str:
#         return ""
#
#     return urllib.parse.unquote(str)


def to_json(d):
    return json.dumps(d, sort_keys=True)


def from_json(json_str):
    if not json_str: return None
    return json.loads(json_str)


def JSONtoDict(json):
    x=json.loads(json)
    return x


def JSONFiletoDict(filename):
  f = open(filename, 'r')
  content = f.read()
  f.close()
  return JSONtoDict(content)
    
# def dictToURLParams(d):
#   if d:
#     return '&'.join([i + '=' + urlencode(v) for i,v in list(d.items())])
#   else:
#     return None
##
## XML escaping and unescaping
## 

# def xml_escape(s):
#     raise Exception('not implemented yet')
#
# def xml_unescape(s):
#     new_s = s.replace('&lt;','<').replace('&gt;','>')
#     return new_s
#
##
## XSS attack prevention
##

random.seed()

def random_string(length=20):
    random.seed()
    ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    r_string = ''
    for i in range(length):
        r_string += random.choice(ALPHABET)

    return r_string

def string_to_datetime(str, fmt="%Y-%m-%d %H:%M"):
  if str is None:
    return None

  return datetime.datetime.strptime(str, fmt)
  
##
## email
##

# from django.core import mail as django_mail
#
# def send_email(sender, recpt_lst, subject, body):
#   logging.error("sending email - %s" % subject)
#   django_mail.send_mail(subject, body, sender, recpt_lst, fail_silently=True)
#

  