const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
const MAX_EXPRESSION_LENGTH = 256;
const MAX_TOKEN_COUNT = 128;

function tokenize(expression) {
    if (expression.length > MAX_EXPRESSION_LENGTH) {
        throw new Error("La expresión es demasiado larga");
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

            while (index < expression.length && /[0-9.]/.test(expression[index])) {
                if (expression[index] === ".") {
                    decimalPointCount++;
                }
                number += expression[index++];
            }

            if (decimalPointCount > 1 || number === ".") {
                throw new Error("Número no válido");
            }

            const value = Number(number);
            if (!Number.isFinite(value)) {
                throw new Error("Número no válido");
            }

            tokens.push({ type: "number", value });
        } else if ("+-*/%()".includes(character)) {
            tokens.push({ type: character, value: character });
            index++;
        } else {
            throw new Error("Carácter no permitido");
        }

        if (tokens.length > MAX_TOKEN_COUNT) {
            throw new Error("La expresión contiene demasiados elementos");
        }
    }

    return tokens;
}

function calculateExpression(expression) {
    const tokens = tokenize(expression);
    let position = 0;

    function parseExpression() {
        let value = parseTerm();

        while (tokens[position]?.type === "+" || tokens[position]?.type === "-") {
            const operator = tokens[position++].type;
            const right = parseTerm();
            value = operator === "+" ? value + right : value - right;
            ensureFinite(value);
        }

        return value;
    }

    function parseTerm() {
        let value = parseUnary();

        while (tokens[position]?.type === "*" || tokens[position]?.type === "/") {
            const operator = tokens[position++].type;
            const right = parseUnary();

            if (operator === "/" && right === 0) {
                throw new Error("No se puede dividir entre cero");
            }

            value = operator === "*" ? value * right : value / right;
            ensureFinite(value);
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

        return parsePostfix();
    }

    function parsePostfix() {
        let value = parsePrimary();

        // El porcentaje es postfix: 50% = 0.5 y 200 * 10% = 20.
        while (tokens[position]?.type === "%") {
            position++;
            value /= 100;
        }

        return value;
    }

    function parsePrimary() {
        const token = tokens[position];

        if (!token) {
            throw new Error("La expresión está incompleta");
        }

        if (token.type === "number") {
            position++;
            return token.value;
        }

        if (token.type === "(") {
            position++;
            const value = parseExpression();

            if (tokens[position]?.type !== ")") {
                throw new Error("Falta cerrar un paréntesis");
            }

            position++;
            return value;
        }

        throw new Error("Expresión no válida");
    }

    function ensureFinite(value) {
        if (!Number.isFinite(value)) {
            throw new Error("El resultado no es un número finito");
        }
    }

    if (tokens.length === 0) {
        throw new Error("La expresión está vacía");
    }

    const result = parseExpression();
    if (position !== tokens.length) {
        throw new Error("Expresión no válida");
    }
    ensureFinite(result);

    // Number(...).toString() conserva los ceros de los enteros (100 sigue siendo 100).
    const roundedResult = Number(result.toFixed(10));
    return String(Object.is(roundedResult, -0) ? 0 : roundedResult);
}

function appendToDisplay(value) {
    if (display.value.length + value.length > MAX_EXPRESSION_LENGTH) {
        return;
    }
    display.value += value;
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.innerText.trim();

        if (value === "AC") {
            display.value = "0";
            return;
        }

        if (value === "DEL") {
            display.value = display.value.slice(0, -1) || "0";
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
            display.value = "0";
        }

        if (value === ".") {
            const currentNumber = display.value.split(/[+*/%()]/).pop().split("-").pop();
            if (currentNumber.includes(".")) {
                return;
            }
            if (!currentNumber) {
                appendToDisplay("0.");
            } else {
                appendToDisplay(".");
            }
            return;
        }

        if (value === "%") {
            if (/[0-9)%]$/.test(display.value)) {
                appendToDisplay(value);
            }
            return;
        }

        if (["+", "-", "*", "/"].includes(value)) {
            if (display.value === "0" && value === "-") {
                display.value = "-";
                return;
            }

            if (/[+*/-]$/.test(display.value)) {
                // Permite signo unario en expresiones como 3 * -2 o 3 - -2.
                if (value === "-" && !display.value.endsWith("-")) {
                    appendToDisplay(value);
                } else if (value !== "-") {
                    display.value = display.value.slice(0, -1) + value;
                }
                return;
            }

            appendToDisplay(value);
            return;
        }

        if (/^\d+$/.test(value)) {
            if (display.value === "0") {
                display.value = value.replace(/^0+(?=\d)/, "") || "0";
            } else {
                appendToDisplay(value);
            }
        }
    });
});
