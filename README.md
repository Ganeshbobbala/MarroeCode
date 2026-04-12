# 🎮 MarroeCode (Gamified Developer Workspace)

An advanced, interactive full-stack learning platform designed to help developers write better, cleaner, and more secure code. This isn't just a basic linter—it's a comprehensive, gamified platform where an AI mentor actively challenges your logic, tests your speed, and simulates real-world constraints.

---

## ✨ Cutting-Edge Modes & Features

### 🧠 Socratic Mentor Mode
Instead of spoon-feeding you the solution, the AI hides the exact code fixes and asks probing questions to help you uncover the logic errors yourself.

### 🎭 AI Persona Reviewers
Choose exactly "who" reviews your code:
- **Standard**: Your helpful, standard AI mentor.
- **Aggressive Linus**: Unforgiving, blunt, and demands absolute optimization.
- **Zen Master**: Calming metaphors and a focus on readable, flowing code.
- **Startup Tech Bro**: Ignores tech debt—just ship it!

### 🐒 Chaos Monkey (Bug Hunt)
Submit working code, and the AI will secretly mutate exactly ONE microscopic logic operator. Your challenge is to play detective and figure out where the bug was injected before time runs out.

### ⏱️ Syntax Speed-Runner
Beat the clock! You have exactly 30 seconds to read a randomly broken code snippet, fix the syntax error, and submit a successful run. 

### ⛳ Code Golf (Min Lines)
A mode dedicated to compact coding. Your AST (Abstract Syntax Tree) is restricted, and you are forced to solve the problem in 5 lines or fewer to pass the test.

### 🌳 Eco-Coder (Carbon Footprint Meter)
A real-time Big-O and **Carbon Footprint** tracker sits above your editor. It analyzes nested loops and estimates the theoretical grams of CO₂ your unoptimized code would burn in a production setting.

### 🛡️ AI Red Teaming (Sec)
Submit code treating the AI as a malicious attacker. The AI actively audits your code for SQL Injections, Cross-Site Scripting (XSS), and vulnerable string concatenations.

### 📊 Blind Spot Analytics Dashboard
The dashboard actively reads through your entire history of reviews and plots your weaknesses:
- **Performance & Big-O Errors**
- **Security Vulnerabilities**
- **Syntax / Scope Issues**
- **Best Practice Violations**

---

## 🚀 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Monaco Editor, Lucide React Icons.
- **Backend**: FastAPI (Python), AST Static Analysis, Subprocess Sandboxing.
- **Languages Supported**: Python, JavaScript, Java, C++.

## ⚙️ How to Run Locally

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser to access the dashboard!

---
*Built to make mastering Data Structures, Algorithms, and Software Design actually fun and interactive.*
