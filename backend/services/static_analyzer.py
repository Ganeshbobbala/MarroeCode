import ast
import tempfile
import subprocess
import os
import re

def run_static_analysis(code: str, language: str) -> list:
    """
    Runs static analysis on the submitted code.
    For Python: checks syntax with ast.parse first, then runs pylint for deeper checks.
    For JavaScript: basic heuristic checks.
    """
    feedback = []

    if language.lower() == "python":
        # ── Step 1: Syntax check via Python's built-in AST parser ──────────────
        try:
            ast.parse(code)
        except SyntaxError as e:
            feedback.append({
                "line": e.lineno,
                "type": "error",
                "message": f"Syntax Error: {e.msg} — `{e.text.strip() if e.text else ''}`",
                "suggestion": (
                    "Fix the syntax error before running further analysis. "
                    "Check for typos in function/variable names, missing quotes around strings, "
                    "or mismatched parentheses."
                )
            })
            # Syntax error means pylint will also fail — return early
            return feedback

        # ── Step 2: Deeper lint via pylint (only if syntax is valid) ───────────
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w', encoding='utf-8') as f:
            f.write(code)
            temp_path = f.name

        try:
            result = subprocess.run(
                ['pylint', temp_path, '--output-format=text',
                 '--disable=C,R', '--score=no'],
                capture_output=True, text=True, timeout=15
            )

            for line in result.stdout.split('\n'):
                # pylint format: /tmp/file.py:10:4: E0001 (error-name) message
                # Only include lines that reference our temp file
                if temp_path not in line:
                    continue
                # Determine severity from pylint code letter  (E=error, W=warning)
                severity = "warning"
                if re.search(r':\s*E\d{4}', line):
                    severity = "error"
                elif re.search(r':\s*W\d{4}', line):
                    severity = "warning"
                else:
                    continue  # skip info/convention lines (already disabled above)

                parts = line.split(':')
                if len(parts) >= 4:
                    try:
                        line_num = int(parts[1])
                        msg = ":".join(parts[3:]).strip()
                        feedback.append({
                            "line": line_num,
                            "type": severity,
                            "message": msg,
                            "suggestion": "Review this line and correct the identified issue."
                        })
                    except ValueError:
                        continue

        except FileNotFoundError:
            # pylint not installed — skip silently
            pass
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            pass
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    elif language.lower() == "javascript":
        # Basic JS heuristics
        lines = code.split('\n')
        for i, line in enumerate(lines, start=1):
            stripped = line.strip()
            if not stripped or stripped.startswith('//'):
                continue
            # Check for missing semicolons on expression statements
            if (stripped and
                not stripped.endswith((';', '{', '}', '(', ',', '*/'))
                and not stripped.startswith(('//', '/*', '*'))
                and not any(kw in stripped for kw in ['if ', 'else', 'for ', 'while ', 'function ', 'class ', '=>'])):
                feedback.append({
                    "line": i,
                    "type": "warning",
                    "message": f"Possible missing semicolon on line {i}.",
                    "suggestion": "Add a semicolon at the end of the statement."
                })

    return feedback
