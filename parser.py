import re
import json
import io 
import requests
import sys

word_list = []
verb_dict = {'KarIxe':'+','KA':'-','KAe':'-','banAe':'+' ,'xie':'-'}
class statement:
	def __int__(self,obj):
		self.subject = obj.subject
		self.quantity = obj.qty
		self.object = obj.object

class equation:
	def __init__(self,statements):
		self.statements = statements



def parseDep(line):
	encoded = json.loads(line)
	strings = encoded[0]['parseText']
	buf = io.StringIO(strings)
	change = ''
	for line in buf.readlines():
		

		if('?' in line):
			change = '?'
		if('((' in line):
			hasQty = False
			tokens = line.split()
			word_attr = ['','','root','']
			for token in tokens:
				if '=' in token:
					key = token.split('=')[0]
					value = token.split('=')[1]
					if(key == 'head'):
						word_attr[0] = re.findall(r'"([^"]*)"', value)[0]
					if(key == 'name'):
						word_attr[1] = re.findall(r'"([^"]*)"', value)[0]
					if(key == 'drel'):
						word_attr[2] = re.findall(r'"([^"]*)"', value)[0]
					if(key == 'af'):
						word_attr[3] = value
		if 'QC' in line and word_attr[2].split(':')[0] == 'k2':
			word_attr[0] = line.split("\t")[1]
		if 'NN' in line and word_attr[2].split(':')[0] == 'k2':
			word_attr[1] = line.split("\t")[1]
		if '))' in line:
			word_list.append(word_attr)

			#print word_list
	return_obj = {}
	subject = ""
	obj = ""
	qty = "x"
	#print word_list
	for each_word in word_list:
		if(each_word[2] == 'root' and each_word[0] != '' and change != '?'):
			change = verb_dict[each_word[0]]
		if each_word[2] != 'root' and each_word[2].split(':')[0] == 'k1':
			subject = subject+ each_word[0]
		if each_word[2] != 'root' and each_word[2].split(':')[0] == 'k2':
			qty = each_word[0]
			obj = each_word[1]
		if each_word[2] != 'root' and each_word[2].split(':')[0] == 'pof':
			#obj = obj+' '+ each_word[0]
			obj = each_word[0]
		if each_word[2] != 'root' and each_word[2].split(':')[0] == 'JJP':
			#obj = obj+' '+ each_word[0]
			obj = each_word[0]
	return_obj["subject"] = str(subject).strip()
	return_obj["object"] = str(obj).strip()
	return_obj["operator"] = change
	return_obj["qty"] = str(qty).strip()
	return json.dumps(return_obj)

r = requests.get('http://'+sys.argv[1]+':'+sys.argv[2]+'/parse/'+sys.argv[3])
try:
	print parseDep(r.text)
except Exception as e:
	print json.dumps({})
