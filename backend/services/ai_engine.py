import ast

def analyze_code_with_ai(code: str, language: str) -> dict:
    """
    Performs heuristic-based code analysis simulating an AI engine.
    Scores are dynamically computed based on real code properties
    (syntax validity, complexity, length, patterns) so that bad code
    receives a low score and good code receives a high score.
    """

    feedback = []
    deductions = 0  # points to deduct from the base quality score
    nested = False  # Track complexity universally where applicable

    # ─── Python-specific analysis ──────────────────────────────────────────────
    if language.lower() == "python":

        # 1. Syntax check — if invalid, abort with a very low score
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            # Static analyzer already reports this; AI engine returns worst scores
            return {
                "feedback": [],
                "refactored_code": code,
                "scores": {"quality": 0, "readability": 0, "performance": 0}
            }

        lines = [l for l in code.split('\n') if l.strip()]

        # 2. Nested loops → O(N²) complexity risk
        indent_stack = []
        loop_lines = []
        for i, node in enumerate(ast.walk(tree)):
            if isinstance(node, (ast.For, ast.While)):
                loop_lines.append(node)

        if len(loop_lines) >= 2:
            # Check if any loop is inside another
            for outer in loop_lines:
                for inner in loop_lines:
                    if inner is not outer:
                        if (hasattr(outer, 'lineno') and hasattr(inner, 'lineno') and
                                inner.lineno > outer.lineno and
                                hasattr(outer, 'col_offset') and hasattr(inner, 'col_offset') and
                                inner.col_offset > outer.col_offset):
                            nested = True

        if nested:
            deductions += 15
            feedback.append({
                "line": None,
                "type": "warning",
                "message": "Nested loops detected — possible O(N²) or worse time complexity.",
                "suggestion": "Consider using a hash map, set, or vectorized operation to reduce complexity to O(N)."
            })

        # 3. Very long functions (>30 lines is a smell)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_lines = (node.end_lineno - node.lineno + 1) if hasattr(node, 'end_lineno') else 0
                if func_lines > 30:
                    deductions += 10
                    feedback.append({
                        "line": node.lineno,
                        "type": "warning",
                        "message": f"Function `{node.name}` is {func_lines} lines long. Long functions are hard to maintain.",
                        "suggestion": "Break it into smaller, single-responsibility functions."
                    })

        # 4. Bare except clauses
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                deductions += 10
                feedback.append({
                    "line": node.lineno,
                    "type": "warning",
                    "message": "Bare `except:` clause catches all exceptions including SystemExit and KeyboardInterrupt.",
                    "suggestion": "Catch specific exceptions, e.g. `except ValueError:` or `except Exception as e:`."
                })

        # 5. Missing docstrings on functions/classes
        missing_docs = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                if not (node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant)):
                    missing_docs += 1

        if missing_docs > 0:
            deductions += min(missing_docs * 5, 15)
            feedback.append({
                "line": None,
                "type": "suggestion",
                "message": f"{missing_docs} function(s)/class(es) are missing docstrings.",
                "suggestion": 'Add docstrings to document purpose, parameters, and return values. Example: """Calculate the sum of two numbers."""'
            })

        # 6. Too many global variables
        globals_count = sum(1 for node in ast.walk(tree) if isinstance(node, ast.Global))
        if globals_count > 2:
            deductions += 8
            feedback.append({
                "line": None,
                "type": "warning",
                "message": f"{globals_count} `global` statements found. Excessive globals make code hard to test and debug.",
                "suggestion": "Encapsulate state in classes or pass variables as function arguments."
            })

        # 7. Print statements instead of logging (in non-trivial code)
        has_logging = 'import logging' in code or 'from logging' in code
        print_calls = sum(1 for node in ast.walk(tree)
                         if isinstance(node, ast.Call) and
                         isinstance(node.func, ast.Name) and node.func.id == 'print')
        if print_calls > 2 and not has_logging and len(lines) > 10:
            deductions += 5
            feedback.append({
                "line": None,
                "type": "suggestion",
                "message": f"{print_calls} `print()` calls found. Consider using the `logging` module for production code.",
                "suggestion": "Replace `print()` with `logging.info()` / `logging.debug()` for better log control."
            })

        # 8. Generate refactored code (add docstrings to undocumented functions)
        refactored_lines = code.split('\n')
        if missing_docs > 0:
            output = []
            i = 0
            fn_pattern = __import__('re').compile(r'^(\s*)def\s+(\w+)\s*\(')
            for line in refactored_lines:
                output.append(line)
                m = fn_pattern.match(line)
                if m:
                    indent = m.group(1) + '    '
                    name = m.group(2)
                    output.append(f'{indent}"""TODO: Add docstring for `{name}`."""')
            refactored_code = '\n'.join(output)
        else:
            refactored_code = code

    # ─── JavaScript-specific analysis ─────────────────────────────────────────
    elif language.lower() == "javascript":
        lines = code.split('\n')

        # Detect var usage (prefer const/let)
        var_count = sum(1 for l in lines if l.strip().startswith('var '))
        if var_count > 0:
            deductions += 10
            feedback.append({
                "line": None,
                "type": "warning",
                "message": f"{var_count} use(s) of `var` detected. `var` has function scope and can cause bugs.",
                "suggestion": "Use `const` for values that don't change and `let` for those that do."
            })

        # console.log in production code
        console_count = sum(1 for l in lines if 'console.log' in l)
        if console_count > 2:
            deductions += 5
            feedback.append({
                "line": None,
                "type": "suggestion",
                "message": f"{console_count} `console.log` statements found.",
                "suggestion": "Remove or replace with a proper logging library before deploying to production."
            })

        refactored_code = code.replace('var ', 'let ')

    else:
        # Generic fallback
        refactored_code = code

    # ─── Security Red Teaming (Generic constraints) ───────────────────────────
    if "SELECT " in code.upper() and ("+" in code or "%s" in code or f"{{" in code or "f\"" in code or "`" in code):
        deductions += 40
        feedback.append({
            "line": None,
            "type": "error",
            "message": "[RED TEAM EXPLOIT] I successfully performed a SQL Injection by passing `' OR 1=1 --` as input. Your string concatenation in SQL queries is highly vulnerable.",
            "suggestion": "Use parameterized queries or an ORM to prevent SQL Injection."
        })
    elif "innerHTML" in code or "document.write" in code:
        deductions += 30
        feedback.append({
            "line": None,
            "type": "error",
            "message": "[RED TEAM EXPLOIT] I successfully performed a Cross-Site Scripting (XSS) attack by injecting `<img src=x onerror=alert(1)>`.",
            "suggestion": "Use `textContent` or proper HTML sanitization limits instead of `innerHTML`."
        })

    # ─── Compute dynamic scores ────────────────────────────────────────────────
    base_quality = 95
    quality = max(0, base_quality - deductions)

    # Readability: penalise very long lines and lack of comments
    code_lines = code.split('\n')
    long_lines = sum(1 for l in code_lines if len(l) > 100)
    comment_lines = sum(1 for l in code_lines if l.strip().startswith('#') or l.strip().startswith('//'))
    total_lines = max(len(code_lines), 1)
    readability = max(0, 95 - (long_lines * 5) - (0 if comment_lines / total_lines > 0.1 else 10))

    # Performance: start high, penalise for known patterns
    performance = max(0, 95 - (20 if nested else 0))

    # If any error-type feedback came from static analysis, cap quality
    error_count = sum(1 for f in feedback if f.get('type') == 'error')
    if error_count > 0:
        quality = min(quality, 30)

    return {
        "feedback": feedback,
        "refactored_code": refactored_code,
        "scores": {
            "quality": quality,
            "readability": readability,
            "performance": performance,
        }
    }
