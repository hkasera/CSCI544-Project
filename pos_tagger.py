#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import sys
from bs4 import BeautifulSoup
import os
import codecs


sys.argv.pop(0)
fileId = sys.argv[0]
sys.argv.pop(0)

if 'OPENSHIFT_DATA_DIR' in os.environ:
	dataPath = os.environ['OPENSHIFT_DATA_DIR']+"output/"+fileId+"-pos-tag.txt"
else:
	dataPath = "data/output/"+fileId+"-pos-tag.txt"

text = " ".join(sys.argv)

r = requests.post("http://text-processing.com/demo/tag/",data={"tagger":"hindi","text":text})
if r.status_code != 200:
	print r.status_code
	exit()
soup = BeautifulSoup(r.text, 'html.parser')
successText = soup.findAll("p", { "class" : "success" })
if successText and len(successText) >= 1:
	pos_tag = successText[0].getText() 
	try:
		opfile = codecs.open(dataPath,'w','utf-8')
		opfile.write(pos_tag)
		opfile.close()
	except Exception as e:
		exit()
exit()
