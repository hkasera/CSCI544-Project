#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
a = "टोकरी में 42 केले थे |"
print a

data = {"language":"hindi","text":a}
r = requests.post("http://text-processing.com/demo/tag/",data={"tagger":"hindi","text":a})
print r.status_code
soup = BeautifulSoup(r.text, 'html.parser')
successText = soup.findAll("p", { "class" : "success" })
if successText and len(successText) >= 1:
	print successText[0].getText()
