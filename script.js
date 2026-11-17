const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

function tokenize(expression) {
    if (expression.length > 256) {
        throw new Error("Expression too long");
    }

    const tokens = [];
    let index = 0;

    while (index < expression.length) {
        const character = expression[index];

        if (/\s/.test(character)) {
            index++;
            continue;
        }

        if (/[0-9.]/.test(character)) {
            let number = "";
            let decimalPointCount = 0;

            while (
                index < expression.length &&
                /[0-9.]/.test(expression[index])
            ) {
                if (expression[index] === ".") {
                    decimalPointCount++;
                }

                number += expression[index];
                index++;
            }

            if (decimalPointCount > 1 || number === ".") {
                throw new Error("Invalid number");
            }

            const value = Number(number);

            if (!Number.isFinite(value)) {
                throw new Error("Invalid number");
            }

            tokens.push({ type: "number", value });
            continue;
        }

        if ("+-*/%()".includes(character)) {
            tokens.push({ type: character, value: character });
            index++;
            continue;
        }

        throw new Error("Invalid character");
    }

    return tokens;
}

function calculateExpression(expression) {
    const tokens = tokenize(expression);
    let position = 0;

    function parseExpression() {
        let value = parseTerm();

        while (
            tokens[position]?.type === "+" ||
            tokens[position]?.type === "-"
        ) {
            const operator = tokens[position++].type;
            const right = parseTerm();

            value = operator === "+"
                ? value + right
                : value - right;
        }

        return value;
    }

    function parseTerm() {
        let value = parseUnary();

        while (
            tokens[position]?.type === "*" ||
            tokens[position]?.type === "/" ||
            tokens[position]?.type === "%"
        ) {
            const operator = tokens[position++].type;
            const right = parseUnary();

            if ((operator === "/" || operator === "%") && right === 0) {
                throw new Error("Division by zero");
            }

            if (operator === "*") {
                value *= right;
            } else if (operator === "/") {
                value /= right;
            } else {
                value %= right;
            }
        }

        return value;
    }

    function parseUnary() {
        if (tokens[position]?.type === "+") {
            position++;
            return parseUnary();
        }

        if (tokens[position]?.type === "-") {
            position++;
            return -parseUnary();
        }

        return parsePrimary();
    }

    function parsePrimary() {
        const token = tokens[position];

        if (!token) {
            throw new Error("Unexpected end of expression");
        }

        if (token.type === "number") {
            position++;
            return token.value;
        }

        if (token.type === "(") {
            position++;
            const value = parseExpression();

            if (tokens[position]?.type !== ")") {
                throw new Error("Missing closing parenthesis");
            }

            position++;
            return value;
        }

        throw new Error("Invalid expression");
    }

    if (tokens.length === 0) {
        throw new Error("Empty expression");
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid expression or result");
    }

    return result;
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.innerText;

        if (value === "AC") {
            display.value = "";
            return;
        }

        if (value === "DEL") {
            display.value = display.value.slice(0, -1);
            return;
        }

        if (value === "=") {
            try {
                display.value = calculateExpression(display.value);
            } catch {
                display.value = "Error";
            }
            return;
        }

        if (display.value === "Error") {
            display.value = "";
        }

        if (display.value === "0") {
            display.value = value;
        } else {
            display.value += value;
        }
    });
});
