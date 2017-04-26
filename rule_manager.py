import codecs
import json

verb_dictionary = json.load(codecs.open('verb_dictionary.json','r','utf8'))

def parseDependencyTree(dependency_tree):

dependency_tree = codecs.open('FullParserOutput.txt','r','utf8');
print verb_dictionary
print parseDependencyTree(dependency_tree)
