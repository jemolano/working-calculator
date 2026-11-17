let display = document.getElementById("display");
let buttons = document.querySelectorAll("button");

function tokenize(input) {
    const sanitized = input
        .replace(/\s+/g, "")
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    if (!/^[0-9+\-*/().%]+$/.test(sanitized)) {
        throw new Error("Invalid expression");
    }

    const tokens = [];
    let number = "";

    for (const char of sanitized) {
        if (/[0-9.]/.test(char)) {
            number += char;
        } else {
            if (number) {
                tokens.push(number);
                number = "";
            }

            if (char === "%") {
                tokens.push("%");
            } else {
                tokens.push(char);
            }
        }
    }

    if (number) {
        tokens.push(number);
    }

    return tokens;
}

function precedence(operator) {
    if (operator === "+" || operator === "-") return 1;
    if (operator === "*" || operator === "/") return 2;
    if (operator === "%") return 3;
    return 0;
}

function applyOperator(left, right, operator) {
    switch (operator) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            if (right === 0) throw new Error("Division by zero");
            return left / right;
        case "%":
            return (left * right) / 100;
        default:
            throw new Error("Unsupported operator");
    }
}

function safeEvaluate(expression) {
    const tokens = tokenize(expression);
    const values = [];
    const operators = [];

    const applyTopOperator = () => {
        const operator = operators.pop();
        const right = values.pop();
        const left = values.pop();

        if (left === undefined || right === undefined) {
            throw new Error("Invalid expression");
        }

        values.push(applyOperator(left, right, operator));
    };

    for (const token of tokens) {
        if (!isNaN(Number(token))) {
            values.push(Number(token));
            continue;
        }

        if (token === "(") {
            operators.push(token);
            continue;
        }

        if (token === ")") {
            while (operators.length && operators[operators.length - 1] !== "(") {
                applyTopOperator();
            }
            if (operators.length === 0 || operators.pop() !== "(") {
                throw new Error("Mismatched parentheses");
            }
            continue;
        }

        if (["+", "-", "*", "/", "%"].includes(token)) {
            while (
                operators.length &&
                operators[operators.length - 1] !== "(" &&
                precedence(operators[operators.length - 1]) >= precedence(token)
            ) {
                applyTopOperator();
            }
            operators.push(token);
            continue;
        }

        throw new Error("Invalid token");
    }

    while (operators.length) {
        const top = operators[operators.length - 1];
        if (top === "(") {
            throw new Error("Mismatched parentheses");
        }
        applyTopOperator();
    }

    if (values.length !== 1 || !Number.isFinite(values[0])) {
        throw new Error("Invalid expression");
    }

    return String(Number(values[0].toFixed(10))).replace(/\.?0+$/, "");
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        let value = button.innerText;

        if (value === "AC") {
            display.value = "";
            return;
        }

        if (value === "DEL") {
            display.value = display.value.slice(0, -1) || "0";
            return;
        }

        if (value === "=") {
            try {
                display.value = safeEvaluate(display.value);
            } catch {
                display.value = "Error";
            }
            return;
        }

        if (display.value === "Error") {
            display.value = value;
            return;
        }

        if (display.value === "0" && /[0-9]/.test(value)) {
            display.value = value;
        } else if (/[\+\-\*\/%]/.test(value) && /[\+\-\*\/%]$/.test(display.value)) {
            display.value = display.value.slice(0, -1) + value;
        } else {
            display.value += value;
        }
    });
});
