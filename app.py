#!/usr/bin/env python

from flask import Flask


from Crypto.Cipher import AES
from Crypto import Random

import binascii
import datetime
import hashlib
import getpass
import logging
import base64
import time
import sys
import os

app = Flask(__name__)

@app.route('/')
def hello_world():
	return app.send_static_file('login.html')

'''
def do_adduser(self, line):
	line = line.split(' ')
	username = line[0]
	global args

	with open(args.home + '/users', 'r') as file:
		userRaw = file.readlines()
	for user in userRaw:
		user = user.strip('\n').split(':')
		if user[0] == username:
			log_event('failure', "User exists")
			return
	journalEntry = user_create(username)
	with open(args.home+"/users", "a") as usersFile:
		usersFile.write(journalEntry)
	log_event('success', "User: %s added to system" % username)
	return


def do_setpassword(self, line):
	line = line.split(' ')
	global args
	with open(args.home + '/users', 'r') as file:
		userRaw = file.readlines()

	i = 0
	#Iterate until we find the user
	while i < len(userRaw):
		#Found the user, so proceed to update
		if userRaw[i].split(':')[0] == args.user:
			startTime = int(time.time())
			iv, hashedPassword = hash_generator()
			journalEntry = "%s:$6$%s$%s:%i\n" % (args.user, iv, hashedPassword, startTime)

			#Rebuild user list and update user file
			userRaw[i] = journalEntry
			with open(args.home + '/users', 'w') as file:
				file.writelines(userRaw)
			log_event('success', 'Password successfully changed')
			#break
			return
		i += 1
	log_event('failure', 'Unable to change password')
	return

def password_hasher(salt, password):
	i = 0
	passwordHash = salt + password
	while i < 10000:
		passwordHash = hashlib.sha512(passwordHash).hexdigest()
		i += 1
	return binascii.hexlify(passwordHash)

def salt_generator():
	return binascii.hexlify(os.urandom(16))

#Confirms user password and returns the salt and hash of the password
def hash_generator(userPass):
	iv = salt_generator()
	log_event('info', 'Successfully generated password hash')
	return iv, password_hasher(iv, userPass)

#Gathers info about user creation and their password data
def user_create(user):
	startTime = int(time.time())
	iv, hashedPassword = hash_generator()
	journalEntry = "%s:$6$%s$%s:%i\n" % (user, iv, hashedPassword, startTime)
	return journalEntry

#Searches for directories and makes them if they don't exist
def directory_maker(directory_path):

	global args

	#Make directory. Use try to handle possible race conditions
	try:
		os.makedirs(args.home+directory_path)
		log_event('info', "Created directory at %s" % (args.home+directory_path))
		return True
	except Exception as e:
		log_event('exception', e)
		return False

def confirm_file(file_path):
	if os.path.exists(file_path):
		return True
	else:
		return False

#Makes sure a file exists by creating it if it doesn't
def force_file(file_path):
	global args
	if confirm_file(args.home + file_path) == False:
		open(args.home + file_path, 'a').close()

#Creates the necessary folder and spawns the user file and creates the admin user at first run
def initialize_system():
	global args
	userChoice = ""
	directory_maker("/data")
	log_event('info', 'Created the data directory in home')	

#Handles user authentication
def authenticate():
	global args
	with open("users", "r") as usersFile:
		userSet = usersFile.readlines()

	for line in userSet:
		line = line.strip('\n').split(':')
		if line[0] == args.user:
			passwordData = line[1].split('$') 
			hashedPassword = password_hasher(passwordData[2], args.password)
			if hashedPassword == passwordData[3]:
				log_event('info', "Successful login")
			else:
				log_event('failure', "Authentication failure")

def log_event(eventStatus, eventDescription):
	global args
	# User timestamp(yyyy-mm-dd-hh-minute-ss-milisecond) status(SUCCESS, INFO, FAILURE, UNAUTHORIZED) description of event
	#info 		success, info
	#warning	unauthorized
	#error		failure
	#critical	exceptions
	currentTime = datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S.%f')
	eventStatus = eventStatus.upper()
	logMessage = "%s: %s %s %s" % (args.user, currentTime, eventStatus, eventDescription)

	if eventStatus in ['SUCCESS', 'INFO']:
		logging.info(logMessage)

	elif eventStatus == 'UNAUTHORIZED':
		logging.warning(logMessage)

	elif eventStatus == 'FAILURE':
		logging.error(logMessage)

	else:
		logging.critical(logMessage)
		
################################################################
# Main
################################################################

logging.basicConfig(filename='auth.log', filemode='a', level=logging.DEBUG)
'''
