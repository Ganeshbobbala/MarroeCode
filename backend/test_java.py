import requests
res = requests.post('http://localhost:8000/api/practice/evaluate', json={'code': 'public class Main { public static void main(String[] args) {} }', 'language': 'java'})
print(res.json())
