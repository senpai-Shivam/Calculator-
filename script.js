// DOM Elements
const displayEl = document.getElementById('display');
const historyEl = document.getElementById('history');

// Core State Variables
let currentInput = '0';
let previousInput = '';
let currentOperator = null;

// Flow Control Flags
let operatorJustPressed = false;
let equalsJustPressed = false;

// Prank State
let isPrankActive = false;
let actualAnswer = null;

// UI Helpers
function getOperatorSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    if (op === '-') return '−';
    return op;
}

function updateDisplay() {
    if (isPrankActive) return; 
    
    let displayValue = currentInput;
    if (displayValue !== 'Error' && displayValue.length > 12) {
        displayValue = parseFloat(displayValue).toPrecision(10);
    }
    
    displayEl.innerText = displayValue;
    
    if (currentOperator !== null) {
        historyEl.innerText = `${previousInput} ${getOperatorSymbol(currentOperator)}`;
    } else if (!equalsJustPressed) {
        historyEl.innerText = '';
    }
}

// Action Handlers
function handleNumber(num) {
    if (isPrankActive) resetPrank();

    if (currentInput === 'Error' || equalsJustPressed) {
        currentInput = num === '.' ? '0.' : num;
        equalsJustPressed = false;
        operatorJustPressed = false;
        historyEl.innerText = ''; 
    } 
    else if (operatorJustPressed || currentInput === '0') {
        currentInput = num === '.' ? '0.' : num;
        operatorJustPressed = false;
    } 
    else {
        if (num === '.' && currentInput.includes('.')) return;
        if (currentInput.replace(/[^0-9]/g,"").length >= 12) return;
        currentInput += num;
    }
    updateDisplay();
}

function handleOperator(op) {
    if (isPrankActive) resetPrank();

    if (operatorJustPressed) {
        currentOperator = op;
        updateDisplay();
        return;
    }

    if (currentOperator !== null && !equalsJustPressed) {
        computeRealAnswer(); 
    }

    previousInput = currentInput;
    currentOperator = op;
    operatorJustPressed = true;
    equalsJustPressed = false;
    currentInput = '0'; 
    
    updateDisplay();
}

function handleAction(action) {
    if (isPrankActive) resetPrank();

    if (action === 'clear') {
        currentInput = '0';
        previousInput = '';
        currentOperator = null;
        operatorJustPressed = false;
        equalsJustPressed = false;
        historyEl.innerText = '';
    } else if (action === 'delete') {
        if (equalsJustPressed || operatorJustPressed || currentInput === 'Error') return;
        currentInput = currentInput.slice(0, -1);
        if (currentInput === '' || currentInput === '-') currentInput = '0';
    }
    updateDisplay();
}

// Math Logic
function computeRealAnswer() {
    let prev = parseFloat(previousInput);
    let current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) return;

    let result;
    switch (currentOperator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': 
            if (current === 0) {
                result = 'Error'; 
            } else {
                result = prev / current; 
            }
            break;
        default: return;
    }

    if (typeof result === 'number') {
        result = Math.round(result * 100000000) / 100000000;
    }
    
    currentInput = result.toString();
    currentOperator = null;
    previousInput = '';
}

function calculate() {
    if (currentOperator === null || operatorJustPressed) return;
    
    let fullEquation = `${previousInput} ${getOperatorSymbol(currentOperator)} ${currentInput} =`;
    
    computeRealAnswer();
    actualAnswer = currentInput; 
    
    historyEl.innerText = fullEquation;
    equalsJustPressed = true;
    operatorJustPressed = false;
    
    activatePrank();
}

// --- Prank Features ---

function activatePrank() {
    isPrankActive = true;
    displayEl.innerHTML = `
        <div class="animate-pop-in text-[22px] sm:text-2xl text-emerald-400 font-bold flex items-center justify-end gap-2 w-full">
            Use your Brain 
            <span class="brain-emoji text-3xl" onclick="revealActualAnswer(event)" title="Click to reveal">🧠</span>
        </div>
    `;
}

function revealActualAnswer(event) {
    if(event) event.stopPropagation();
    isPrankActive = false;
    
    displayEl.innerHTML = `<span class="animate-reveal text-emerald-300 font-bold inline-block">${actualAnswer}</span>`;
    
    currentInput = actualAnswer;
    equalsJustPressed = true; 
}

function resetPrank() {
    isPrankActive = false;
}

// --- Keyboard Support (Fully PC Compatible) ---
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        handleNumber(key);
    } else if (key === '.') {
        handleNumber('.');
    } else if (key === '+' || key === '-') {
        handleOperator(key);
    } else if (key === '*') {
        handleOperator('*');
    } else if (key === '/') {
        event.preventDefault(); 
        handleOperator('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); 
        calculate();
    } else if (key === 'Backspace') {
        handleAction('delete');
    } else if (key === 'Escape' || key === 'Delete') {
        handleAction('clear');
    }
});

updateDisplay();
