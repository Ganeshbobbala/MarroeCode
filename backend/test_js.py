import requests
res = requests.post('http://localhost:8000/api/run', json={'code': 'console.log("Hello JS");', 'language': 'javascript'})
print(res.json())
res = requests.post('http://localhost:8000/api/practice/evaluate', json={'code': 'console.log("Hello JS");', 'language': 'javascript'})
print(res.json())
