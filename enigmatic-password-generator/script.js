
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function validateInputs(principal, interestRate, tenure) {
    const errors = [];
    
    if (isNaN(principal) || principal <= 0) {
        errors.push('Principal amount must be a positive number');
    }
    
    if (isNaN(interestRate) || interestRate <= 0 || interestRate > 100) {
        errors.push('Interest rate must be between 0.1% and 100%');
    }
    
    if (isNaN(tenure) || tenure <= 0 || tenure > 50) {
        errors.push('Tenure must be between 1 and 50 years');
    }
    
    return errors;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function addToHistory(principal, interestRate, tenure, maturityAmount, totalInterest) {
    const historyList = document.getElementById('historyList');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const date = new Date().toLocaleDateString();
    historyItem.innerHTML = `
        <div class="history-header">
            <span class="history-date">${date}</span>
            <button class="delete-history" onclick="deleteHistoryItem(this)">×</button>
        </div>
        <div class="history-details">
            <small>Principal: ${formatCurrency(principal)} | Rate: ${interestRate}% | Tenure: ${tenure} years</small>
            <div><strong>Maturity: ${formatCurrency(maturityAmount)}</strong></div>
        </div>
    `;
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Limit history to 10 items
    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
    
    // Show history section
    document.getElementById('historySection').style.display = 'block';
}

function deleteHistoryItem(button) {
    const historyItem = button.closest('.history-item');
    historyItem.remove();
    
    // Hide history section if no items
    const historyList = document.getElementById('historyList');
    if (historyList.children.length === 0) {
        document.getElementById('historySection').style.display = 'none';
    }
}

function clearHistory() {
    document.getElementById('historyList').innerHTML = '';
    document.getElementById('historySection').style.display = 'none';
}

function calculateMaturityAmount() {
    // Hide previous error
    document.getElementById('error').style.display = 'none';
    
    const principal = parseFloat(document.getElementById('principal').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const tenure = parseFloat(document.getElementById('tenure').value);
    
    // Validate inputs
    const errors = validateInputs(principal, interestRate, tenure);
    if (errors.length > 0) {
        showError(errors.join('. '));
        return;
    }
    
    // Calculate using compound interest formula: A = P(1 + r/100)^t
    const maturityAmount = principal * Math.pow((1 + interestRate / 100), tenure);
    const totalInterest = maturityAmount - principal;
    
    // Update result display with animation
    const resultDiv = document.getElementById('result');
    const breakdownDiv = document.getElementById('breakdown');
    
    resultDiv.innerHTML = `
        <div class="result-main">
            <div class="result-label">Maturity Amount</div>
            <div class="result-amount">${formatCurrency(maturityAmount)}</div>
        </div>
    `;
    
    breakdownDiv.innerHTML = `
        <div class="breakdown-item">
            <span>Principal Amount:</span>
            <span>${formatCurrency(principal)}</span>
        </div>
        <div class="breakdown-item">
            <span>Total Interest Earned:</span>
            <span class="interest-earned">${formatCurrency(totalInterest)}</span>
        </div>
        <div class="breakdown-item">
            <span>Interest Rate:</span>
            <span>${interestRate}% per year</span>
        </div>
        <div class="breakdown-item">
            <span>Tenure:</span>
            <span>${tenure} year${tenure > 1 ? 's' : ''}</span>
        </div>
        <div class="breakdown-item total">
            <span><strong>Total Maturity Amount:</strong></span>
            <span><strong>${formatCurrency(maturityAmount)}</strong></span>
        </div>
    `;
    
    // Show breakdown section
    breakdownDiv.style.display = 'block';
    
    // Add to history
    addToHistory(principal, interestRate, tenure, maturityAmount, totalInterest);
    
    // Add success animation
    resultDiv.classList.add('animate-result');
    setTimeout(() => {
        resultDiv.classList.remove('animate-result');
    }, 600);
}

function resetCalculator() {
    document.getElementById('principal').value = '';
    document.getElementById('interestRate').value = '';
    document.getElementById('tenure').value = '';
    document.getElementById('result').innerHTML = '<div class="result-placeholder">Enter values and click Calculate</div>';
    document.getElementById('breakdown').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

// Event listeners
document.getElementById('calculateButton').addEventListener('click', calculateMaturityAmount);
document.getElementById('resetButton').addEventListener('click', resetCalculator);
document.getElementById('clearHistoryButton').addEventListener('click', clearHistory);

// Enter key support
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        calculateMaturityAmount();
    }
});

// Add input formatting
document.getElementById('principal').addEventListener('input', function(e) {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    e.target.value = value;
});

document.getElementById('interestRate').addEventListener('input', function(e) {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (parseFloat(value) > 100) {
        e.target.value = '100';
    } else {
        e.target.value = value;
    }
});

document.getElementById('tenure').addEventListener('input', function(e) {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (parseFloat(value) > 50) {
        e.target.value = '50';
    } else {
        e.target.value = value;
    }
});