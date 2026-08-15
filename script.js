let currentInput = '0';
let previousInput = '';
let operation = null;
let resetDisplay = false;

const display = document.getElementById('display');
const history = document.getElementById('history');

function updateDisplay() {
    display.textContent = currentInput;
    if (operation !== null && previousInput !== '') {
        const symbol = operation === '*' ? '×' : operation === '/' ? '÷' : operation;
        history.textContent = `${previousInput} ${symbol}`;
    } else {
        history.textContent = '';
    }
}

function appendNumber(number) {
    if (currentInput === '0' || resetDisplay) {
        currentInput = number;
        resetDisplay = false;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function appendDecimal(dot) {
    if (resetDisplay) {
        currentInput = '0.';
        resetDisplay = false;
        updateDisplay();
        return;
    }
    if (!currentInput.includes(dot)) {
        currentInput += dot;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operation !== null && !resetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operation = op;
    resetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operation = null;
    resetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (resetDisplay) return;
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function calculate() {
    if (operation === null || previousInput === '') return;

    let result;
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(curr)) return;

    switch (operation) {
        case '+':
            result = prev + curr;
            break;
        case '-':
            result = prev - curr;
            break;
        case '*':
            result = prev * curr;
            break;
        case '/':
            result = curr === 0 ? 'Error' : prev / curr;
            break;
        case '%':
            result = (prev * curr) / 100;
            break;
        default:
            return;
    }

    // Prank feature example (can customize output if desired)
    currentInput = (typeof result === 'number') ? String(parseFloat(result.toFixed(8))) : result;
    operation = null;
    previousInput = '';
    resetDisplay = true;
    updateDisplay();
}

// Keyboard Support
window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9')) {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendDecimal('.');
    } else if (['+', '-', '*', '/'].includes(e.key)) {
        appendOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        deleteLast();
    } else if (e.key === 'Escape') {
        clearDisplay();
    }
});
