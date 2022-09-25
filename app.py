# def holamundos():
#     hola = 'hola mundo'
#     #print(hola)
#     return hola

# print(holamundos())

import sys
import json
import ast
import pandas as pd

#data_to_pass_back = 'send this to node process weimar'

input =ast.literal_eval(sys.argv[1])
#output = input
arrayes = [[52,23,0],[15,25,1]]
#output['Data_returnes'] = arrayes#data_to_pass_back
#print(json.dumps(output))
# print(output)
points = pd.read_csv('Pca_diabetes.csv')
arr = points.to_numpy()
arr2 = arr.tolist()

# df = pd.DataFrame()
# nombres = ['Dary', 'deysi', 'weimar']
# edades = [42, 40, 37]

# df['Nombre'] = nombres
# df['Edad'] = edades

#df.to_csv('ejemplo.csv', encoding='utf-8', index=False)
#print('listo py 1')
print(json.dumps(arr2))
sys.stdout.flush()
