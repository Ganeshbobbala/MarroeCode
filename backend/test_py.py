import requests

bp = """def main():
    # Write your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()
"""

res = requests.post('http://localhost:8000/api/run', json={'code': bp, 'language': 'python'})
print("RUN PY:", res.text)

res = requests.post('http://localhost:8000/api/practice/evaluate', json={'code': bp, 'language': 'python'})
print("EVAL PY:", res.text)
