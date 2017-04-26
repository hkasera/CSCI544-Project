#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import sys
from bs4 import BeautifulSoup

sys.argv.pop(0)
text = " ".join(sys.argv)
print text

r = requests.post("http://text-processing.com/demo/tag/",data={"tagger":"hindi","text":text})
if r.status_code != 200:
	print r.status_code
	exit()
soup = BeautifulSoup(r.text, 'html.parser')
successText = soup.findAll("p", { "class" : "success" })
if successText and len(successText) >= 1:
	print successText[0].getText()
exit()
