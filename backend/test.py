import requests
res = requests.post('http://localhost:8000/api/run', json={'code': '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello" << endl; return 0; }', 'language': 'c++'})
print(res.json())
