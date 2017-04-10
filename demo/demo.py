import re
verb_dict = {'KarIxe':'+','KA':'-','KAe':'-','banAe':'+' }
def aditya():

	subject = ''
	obj = ''
	qty = 'x'
	recipient = ''
	change=''
	#f.close()
	######33
	################## target 'ne' and  'se'
	f1 = open('sentence.txt','r')

	#inp = json.loads(f)
	#print(inp)
	#print(type(f1))
	q_line = 0
	line = f1.readline()
	#print(line)
	#final_line = line
	word_list = []
	while(line):
		#print(line)
		if('?' in line):
		#print('here')
			change = '?'
	
		word_attr = ['','','root','']
		if('((' in line):
			tokens = line.split()
			#word_attr = []
			
			for token in tokens:
				if '=' in token:
					key = token.split('=')[0]
					value = token.split('=')[1]
					if(key == 'head'):
						#word_attr.append(value)
						word_attr[0] = re.findall(r'"([^"]*)"', value)[0]
					if(key == 'name'):
						#word_attr.append(value)
						word_attr[1] = re.findall(r'"([^"]*)"', value)[0]
					if(key == 'drel'):
						word_attr[2] = re.findall(r'"([^"]*)"', value)[0]
						#word_attr.append(value)
					if(key == 'af'):
						word_attr[3] = value
					#print(word_attr)
			word_list.append(word_attr)
		#search for word_attr[2]
		if(word_attr[2].split(':')[0] == 'k1'):
			subject = subject + word_attr[0]
		if(word_attr[2] == 'root' and word_attr[0] != ''):
			#print(word_attr)
			#if(q_line):
			#	change = '?'
			#else:
			change = verb_dict[word_attr[0]]	
		if(word_attr[2].split(':')[0] == 'k2'):	
			obj = obj + word_attr[0]
			line = f1.readline()
			while('))' not in line):
				#print(line)
				if(line.split()[2] == 'QC'):
					qty = int(line.split()[1])
					break
				line=f1.readline()
		line = f1.readline()
	f1.close()
	print("below")
	print(subject,obj,qty)
	if(q_line):
		change = '?'
			#else:
	return(subject,obj,qty,change)








#main


lists =dict()
with open("tree.txt",'r') as f:
	line = f.readline()

	while(line):
		#print(line)
		
		if('Sentence id' in line):
			f1 = open("sentence.txt","w")
			id = line.split('="')[1][:-3]
			#rint(id)
		if(line != '</Sentence>'):
			f1.write(line)
			#line = f.readline()
		if (line.strip() == "</Sentence>"):
			#print("here")
			f1.close()
			subject,obj,quant,change = aditya()
			lists[id] = {}
			lists[id]['subject'] = subject
			lists[id]['obj'] = obj
			lists[id]['quant'] = quant
			lists[id]['change'] = change
			#f1.seek(0)
			#f1.truncate
		line = f.readline()
if (lists['1']['change'] == '-'):
		lists['1']['quant'] = lists['1']['quant'] * -1
if (lists['2']['change'] == '-'):
	lists['2']['quant'] = lists['2']['quant'] * -1
	
if(lists['1']['subject'] == lists['2']['subject'] and lists['1']['obj'] == lists['2']['obj']):
	lists['3']['quant'] = lists['1']['quant'] + lists['2']['quant']

print(lists['3']['quant'])

