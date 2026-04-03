
PRACTICE_CONCEPTS = [
    {
        "id": "ternary",
        "name": "Age Eligibility Checker",
        "difficulty": "Beginner",
        "description": "Mastering logical flow for age-based restrictions.",
        "theory": "The ternary operator is the most efficient way to handle 'pass/fail' age checks. It evaluates a condition (age >= 18) and immediately returns one of two strings without the need for verbose if-else blocks.",
        "real_world": "Used in almost every website with age restrictions: liquor stores, voting registration, social media sign-ups, and insurance premium calculators.",
        "goal": "Write a one-liner to check if a person is eligible (age >= 18). Print 'Eligible' if true, otherwise print 'Minor'. Input 'age' is provided via stdin.",
        "boilerplates": {
            "java": "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Check age >= 18 using (condition ? \"Eligible\" : \"Minor\")\n    }\n}",
            "python": "import sys\n# Read age from stdin and use a ternary expression to print \"Eligible\" or \"Minor\"\n# print(\"Eligible\" if age >= 18 else \"Minor\")",
            "javascript": "// Assume a variable 'age' exists. Use a ternary to log \"Eligible\" or \"Minor\"\nconst age = 20;\n",
            "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    int age;\n    // Read age and use (age >= 18 ? \"Eligible\" : \"Minor\")\n    return 0;\n}"
        }
    },
    {
        "id": "recursion",
        "name": "Recursive Thinking",
        "difficulty": "Intermediate",
        "description": "Solving problems by breaking them into smaller instances of themselves.",
        "theory": "Recursion occurs when a function calls itself. A valid recursive function MUST have: 1) A Base Case (to stop the loop) and 2) A Recursive Step (to move closer to the base case). It uses the 'Call Stack' to manage multiple function executions.",
        "real_world": "Used extensively in navigating hierarchical data like File Systems (folders within folders), Web DOM trees, JSON parsing, and searching through complex Social Network graphs.",
        "goal": "Implement a recursive function to calculate the Factorial of a number 'n'.",
        "boilerplates": {
            "java": "public class Main {\n    public static int factorial(int n) {\n        // 1. Base case: if n <= 1 return 1\n        // 2. Recursive call: n * factorial(n-1)\n        return 0;\n    }\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}",
            "python": "def factorial(n):\n    # TODO: Implement base case and recursion\n    pass\n\nprint(factorial(5))",
            "javascript": "function factorial(n) {\n    // TODO: Implement recursion\n}\nconsole.log(factorial(5));",
            "cpp": "#include <iostream>\nusing namespace std;\nint factorial(int n) {\n    // TODO: Implement recursion\n    return 1;\n}\nint main() {\n    cout << factorial(5) << endl;\n    return 0;\n}"
        }
    },
    {
        "id": "nesting",
        "name": "Nested Loops & Matrix",
        "difficulty": "Intermediate",
        "description": "Navigating 2D data structures.",
        "theory": "Nested loops are loops inside of loops. For every single iteration of the 'Outer' loop, the 'Inner' loop runs to completion. This creates a coordinate system (i, j) that maps perfectly to grids or tables.",
        "real_world": "Essential for Game Development (processing a map grid), Data Science (matrix multiplication), Image Processing (looping over every pixel in height and width), and generating HTML tables from database records.",
        "goal": "Print a 3x3 identity matrix (1s on diagonal, 0s elsewhere) using nested loops.",
        "boilerplates": {
            "java": "public class Main {\n    public static void main(String[] args) {\n        for(int i=0; i<3; i++) {\n            for(int j=0; j<3; j++) {\n                // If i == j print 1, else 0\n            }\n        }\n    }\n}",
            "python": "for i in range(3):\n    # Inner loop for j in range(3)\n    pass",
            "javascript": "for(let i=0; i<3; i++) {\n    // Inner loop here\n}",
            "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    // Use nested for loops to print a 3x3 matrix\n    return 0;\n}"
        }
    },
    {
        "id": "oop",
        "name": "OOP Basics",
        "difficulty": "Advanced",
        "description": "Encapsulating data and behavior.",
        "theory": "Object-Oriented Programming (OOP) is a paradigm based on 'Objects' which contain data (attributes) and code (methods). It allows for better code organization through Encapsulation, Inheritance, and Polymorphism.",
        "real_world": "The foundation of almost all modern software. In an E-commerce app, a 'User', 'Product', and 'Order' are all Classes. It allows developers to model software components after real-world objects.",
        "goal": "Create a 'Car' class with 'brand' and 'year' properties, and a method 'display()' that prints them.",
        "boilerplates": {
            "java": "class Car {\n    // Define brand, year, constructor, and display()\n}\npublic class Main {\n    public static void main(String[] args) {\n        // Instantiate Car and call display()\n    }\n}",
            "python": "class Car:\n    # Define __init__ and display\n    pass",
            "javascript": "class Car {\n    // Define constructor and display method\n}",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\nclass Car {\n    // Define public attributes and display function\n};\nint main() { return 0; }"
        }
    }
]
