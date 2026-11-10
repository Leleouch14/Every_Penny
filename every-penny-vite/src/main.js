import Chart from 'chart.js/auto';
import { getDailySummary, getMonthlyExpenses } from './reports.js';

// Local State initialized from localStorage (starts empty if no saved data)
let transactions = JSON.parse(localStorage.getItem('every_penny_txns')) || [];

// Load user-defined budget limit from localStorage or default to ₹10,000
let budgetLimit = parseFloat(localStorage.getItem('every_penny_budget')) || 10000;
let currentFilter = 'all';
let showAllTransactions = false;
let chartInstance = null;
let currentChartType = 'expense';
let currentChartMode = 'daily';
let splits = JSON.parse(localStorage.getItem('every_penny_splits')) || [];
let currentActivePage = 'home'; // 'home', 'splits'
let splitsChartInstance = null;

// Page Router
window.switchPage = function(page) {
    currentActivePage = page;
    const pageHome = document.getElementById('pageHome');
    const pageSplits = document.getElementById('pageSplits');
    const pageConfigs = document.getElementById('pageConfigs');
    const navHome = document.getElementById('navHome');
    const navConfigs = document.getElementById('navConfigs');
    const navSplits = document.getElementById('navSplits');

    // Hide all pages
    [pageHome, pageSplits, pageConfigs].forEach(p => {
        if (p) {
            p.classList.remove('flex');
            p.classList.add('hidden');
        }
    });

    // Reset all nav highlights
    [navHome, navConfigs, navSplits].forEach(n => {
        if (n) {
            n.className = "flex flex-col items-center gap-1 text-[#7A6962] px-4 py-1.5 rounded-full hover:text-[#2D2421] text-xs font-semibold transition";
        }
    });

    if (page === 'home') {
        pageHome.classList.remove('hidden');
        pageHome.classList.add('flex');
        navHome.className = "flex flex-col items-center gap-1 text-[#BF5B3E] px-4 py-1.5 rounded-full bg-[#BF5B3E]/15 text-xs font-semibold transition";
        render();
    } else if (page === 'configs') {
        pageConfigs.classList.remove('hidden');
        pageConfigs.classList.add('flex');
        navConfigs.className = "flex flex-col items-center gap-1 text-[#BF5B3E] px-4 py-1.5 rounded-full bg-[#BF5B3E]/15 text-xs font-semibold transition";
    } else {
        pageSplits.classList.remove('hidden');
        pageSplits.classList.add('flex');
        navSplits.className = "flex flex-col items-center gap-1 text-[#BF5B3E] px-4 py-1.5 rounded-full bg-[#BF5B3E]/15 text-xs font-semibold transition";
        renderSplits();
    }
};

// Splits Handlers
window.handleSplitSubmit = function(event) {
    event.preventDefault();
    const friend = document.getElementById('splitFriend').value.trim();
    const amount = parseFloat(document.getElementById('splitAmount').value);
    const direction = document.getElementById('splitDirection').value; // 'me' (they give) or 'them' (you give)
    const note = document.getElementById('splitNote').value.trim();

    splits.unshift({
        id: Date.now(),
        friend,
        amount,
        direction,
        note,
        completed: false
    });

    localStorage.setItem('every_penny_splits', JSON.stringify(splits));
    document.getElementById('splitForm').reset();
    renderSplits();
};

window.toggleSplitComplete = function(id) {
    splits = splits.map(s => {
        if (s.id === id) {
            return { ...s, completed: !s.completed };
        }
        return s;
    });
    localStorage.setItem('every_penny_splits', JSON.stringify(splits));
    renderSplits();
};

window.deleteSplit = function(id) {
    splits = splits.filter(s => s.id !== id);
    localStorage.setItem('every_penny_splits', JSON.stringify(splits));
    renderSplits();
};

function renderSplits() {
    let totalReceive = 0; // Direction 'me' (They give)
    let totalPay = 0;     // Direction 'them' (You give)

    splits.forEach(s => {
        if (!s.completed) {
            if (s.direction === 'me') totalReceive += s.amount;
            else totalPay += s.amount;
        }
    });

    const netPosition = totalReceive - totalPay;
    document.getElementById('totalReceive').innerText = `₹${totalReceive.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('totalPay').innerText = `₹${totalPay.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    
    const netEl = document.getElementById('splitNetBalance');
    netEl.innerText = `${netPosition >= 0 ? '+' : ''}₹${netPosition.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    netEl.className = netPosition >= 0 ? "text-xl font-bold text-[#437158]" : "text-xl font-bold text-[#BF5B3E]";

    // Render Splits List
    const listContainer = document.getElementById('splitsList');
    listContainer.innerHTML = '';

    if (splits.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-6 text-[#7A6962] text-xs">No active friend splits found</div>`;
    } else {
        splits.forEach(s => {
            const isReceive = s.direction === 'me';
            const card = document.createElement('div');
            card.className = `bg-[#F4EFEA] border ${s.completed ? 'border-[#D4C5B9] opacity-60' : 'border-[#D4C5B9]'} rounded-xl p-3.5 flex justify-between items-center shadow-sm transition`;
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <button onclick="toggleSplitComplete(${s.id})" class="w-6 h-6 rounded-lg border border-[#D4C5B9] flex items-center justify-center text-xs font-bold ${s.completed ? 'bg-[#437158] text-white border-[#437158]' : 'bg-[#ECE4DC] text-transparent'} transition">
                        ✓
                    </button>
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold ${s.completed ? 'line-through text-[#8C7870]' : 'text-[#2D2421]'}">${s.friend} <span class="text-xs font-normal text-[#7A6962]">(${s.note})</span></span>
                        <span class="text-[11px] text-[#7A6962]">${s.completed ? 'Completed / Settled' : (isReceive ? 'They owe you' : 'You owe them')}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm font-bold ${s.completed ? 'text-[#8C7870] line-through' : (isReceive ? 'text-[#437158]' : 'text-[#BF5B3E]')}">${isReceive ? '+' : '-'}₹${s.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    <button onclick="deleteSplit(${s.id})" class="text-[#8C7870] hover:text-[#BF5B3E] text-xs transition">✕</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    // Render Splits Chart
    const ctx = document.getElementById('splitsChart').getContext('2d');
    if (splitsChartInstance) {
        splitsChartInstance.destroy();
    }

    splitsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['You Receive (They Give)', 'You Pay (They Take)'],
            datasets: [{
                data: [totalReceive || 0.01, totalPay || 0.01],
                backgroundColor: ['#437158', '#BF5B3E'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: '#2D2421' } }
            }
        }
    });
}
// Export & Import Handlers
window.exportTable = function(tableType) {
    if (tableType === 'all_json') {
        const backup = {
            transactions,
            splits,
            budgetLimit,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `every_penny_full_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return;
    }

    let data = [];
    let filename = '';
    if (tableType === 'transactions') {
        data = transactions;
        filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (tableType === 'splits') {
        data = splits;
        filename = `splits_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (data.length === 0) {
        alert("No data available to export for " + tableType);
        return;
    }

    // Extract headers
    const keys = Object.keys(data[0]);
    let csvContent = keys.join(',') + '\n';

    data.forEach(row => {
        const values = keys.map(k => {
            let val = row[k];
            if (val === undefined || val === null) val = '';
            val = String(val).replace(/"/g, '""');
            if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                val = `"${val}"`;
            }
            return val;
        });
        csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

window.handleFileUpload = function() {
    const target = document.getElementById('importTarget').value;
    const fileInput = document.getElementById('importFile');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file to import.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        try {
            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(content);
                if (target === 'transactions') {
                    if (Array.isArray(parsed)) transactions = parsed;
                    else if (parsed.transactions) transactions = parsed.transactions;
                } else if (target === 'splits') {
                    if (Array.isArray(parsed)) splits = parsed;
                    else if (parsed.splits) splits = splits;
                }
                if (parsed.budgetLimit) budgetLimit = parseFloat(parsed.budgetLimit);
                saveToStorage();
                localStorage.setItem('every_penny_splits', JSON.stringify(splits));
                alert("Successfully imported JSON backup!");
            } else if (file.name.endsWith('.csv')) {
                const lines = content.split('\n').filter(l => l.trim() !== '');
                if (lines.length < 2) {
                    alert("CSV file is empty or missing headers.");
                    return;
                }
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const newRows = [];

                for (let i = 1; i < lines.length; i++) {
                    const row = {};
                    const currentLine = lines[i];
                    // Simple CSV parser supporting quoted strings
                    const values = [];
                    let inQuote = false;
                    let val = '';
                    for (let c = 0; c < currentLine.length; c++) {
                        let char = currentLine[c];
                        if (char === '"') {
                            inQuote = !inQuote;
                        } else if (char === ',' && !inQuote) {
                            values.push(val.trim().replace(/^"|"$/g, ''));
                            val = '';
                        } else {
                            val += char;
                        }
                    }
                    values.push(val.trim().replace(/^"|"$/g, ''));

                    headers.forEach((h, idx) => {
                        let v = values[idx] !== undefined ? values[idx] : '';
                        // Type casting
                        if (h === 'amount' || h === 'id') v = Number(v) || v;
                        if (h === 'completed') v = v === 'true' || v === true;
                        row[h] = v;
                    });
                    newRows.push(row);
                }

                if (target === 'transactions') {
                    transactions = newRows;
                    saveToStorage();
                } else if (target === 'splits') {
                    splits = newRows;
                    localStorage.setItem('every_penny_splits', JSON.stringify(splits));
                }
                alert(`Successfully imported ${newRows.length} rows into ${target}!`);
            } else {
                alert("Unsupported file format. Please upload .csv or .json");
            }
        } catch (err) {
            console.error(err);
            alert("Error parsing file: " + err.message);
        }
    };

    reader.readAsText(file);
};

let statsChartInstance = null;
let currentStatsTab = 'category';

// Switch chart mode (Daily vs Monthly)
window.switchChartMode = function(mode) {
    currentChartMode = mode;
    const btnDaily = document.getElementById('modeDaily');
    const btnMonthly = document.getElementById('modeMonthly');
    if (mode === 'daily') {
        btnDaily.className = "px-2 py-1 rounded-md font-semibold bg-[#BF5B3E] text-white transition";
        btnMonthly.className = "px-2 py-1 rounded-md font-semibold text-[#7A6962] transition";
    } else {
        btnMonthly.className = "px-2 py-1 rounded-md font-semibold bg-[#BF5B3E] text-white transition";
        btnDaily.className = "px-2 py-1 rounded-md font-semibold text-[#7A6962] transition";
    }
    updateChartTitle();
    renderChart();
};

// Switch chart type on main dashboard
window.switchChartType = function(type) {
    currentChartType = type;
    ['expense', 'earnings', 'comparison'].forEach(t => {
        const btn = document.getElementById(`btnChart${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) {
            if (t === type) {
                btn.className = "flex-1 py-1 rounded-md font-semibold bg-[#BF5B3E] text-white transition";
            } else {
                btn.className = "flex-1 py-1 rounded-md font-semibold text-[#7A6962] transition";
            }
        }
    });
    updateChartTitle();
    renderChart();
};

function updateChartTitle() {
    const titleEl = document.getElementById('chartTitle');
    if (!titleEl) return;
    const modeLabel = currentChartMode === 'daily' ? 'Daily' : 'Monthly';
    if (currentChartType === 'expense') titleEl.innerText = `${modeLabel} Expenses Overview`;
    else if (currentChartType === 'earnings') titleEl.innerText = `${modeLabel} Earnings Overview`;
    else titleEl.innerText = `${modeLabel} Earnings vs Expenses Comparison`;
}

// Stats Modal Controllers
window.openStats = function() {
    document.getElementById('statsModal').classList.remove('hidden');
    document.getElementById('statsModal').classList.add('flex');
    renderStatsModal();
};

window.closeStats = function() {
    document.getElementById('statsModal').classList.remove('flex');
    document.getElementById('statsModal').classList.add('hidden');
    if (statsChartInstance) {
        statsChartInstance.destroy();
        statsChartInstance = null;
    }
};

window.switchStatsTab = function(tab) {
    currentStatsTab = tab;
    const btnCat = document.getElementById('statsTabCategory');
    const btnTrd = document.getElementById('statsTabTrend');
    if (tab === 'category') {
        btnCat.className = "flex-1 py-2 rounded-lg font-semibold bg-[#BF5B3E] text-white transition";
        btnTrd.className = "flex-1 py-2 rounded-lg font-semibold text-[#7A6962] transition";
    } else {
        btnTrd.className = "flex-1 py-2 rounded-lg font-semibold bg-[#BF5B3E] text-white transition";
        btnCat.className = "flex-1 py-2 rounded-lg font-semibold text-[#7A6962] transition";
    }
    renderStatsModal();
};

function renderStatsModal() {
    const ctx = document.getElementById('statsModalChart').getContext('2d');
    if (statsChartInstance) {
        statsChartInstance.destroy();
        statsChartInstance = null;
    }

    const summaryEl = document.getElementById('statsSummaryText');

    if (currentStatsTab === 'category') {
        // Aggregate expenses by tag
        const tagMap = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const tag = t.tag || 'General';
            tagMap[tag] = (tagMap[tag] || 0) + t.amount;
        });

        const labels = Object.keys(tagMap);
        const data = Object.values(tagMap);
        const totalExp = data.reduce((a, b) => a + b, 0);

        summaryEl.innerText = `Total Tracked Expenses: ₹${totalExp.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

        statsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    data: labels.length ? data : [1],
                    backgroundColor: ['#BF5B3E', '#D97757', '#437158', '#E2D7CC', '#8C7870', '#7A6962'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: '#2D2421' } }
                }
            }
        });
    } else {
        // Trend comparison: Earnings vs Expenses by Date
        const dateMap = {};
        transactions.forEach(t => {
            if (!dateMap[t.date]) dateMap[t.date] = { earning: 0, expense: 0 };
            dateMap[t.date][t.type] += t.amount;
        });

        const sortedDates = Object.keys(dateMap).sort();
        const earningData = sortedDates.map(d => dateMap[d].earning);
        const expenseData = sortedDates.map(d => dateMap[d].expense);

        const totalEarn = earningData.reduce((a, b) => a + b, 0);
        const totalExp = expenseData.reduce((a, b) => a + b, 0);
        summaryEl.innerText = `Total Earned: ₹${totalEarn.toLocaleString('en-IN')} | Total Spent: ₹${totalExp.toLocaleString('en-IN')}`;

        statsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDates.length ? sortedDates : ['No Data'],
                datasets: [
                    {
                        label: 'Earnings (₹)',
                        data: sortedDates.length ? earningData : [0],
                        backgroundColor: '#437158',
                        borderRadius: 4
                    },
                    {
                        label: 'Expenses (₹)',
                        data: sortedDates.length ? expenseData : [0],
                        backgroundColor: '#BF5B3E',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: '#2D2421' } }
                },
                scales: {
                    x: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } },
                    y: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } }
                }
            }
        });
    }
}

// Save to localStorage and re-render UI
function saveToStorage() {
    localStorage.setItem('every_penny_txns', JSON.stringify(transactions));
    localStorage.setItem('every_penny_budget', budgetLimit);
    render();
}

// Global handler to prompt and update the custom monthly budget limit
window.editBudget = function() {
    const newBudget = prompt("Enter new monthly budget limit (₹):", budgetLimit);
    if (newBudget !== null && !isNaN(newBudget) && newBudget.trim() !== "") {
        budgetLimit = parseFloat(newBudget);
        saveToStorage();
    }
}

// Make functions globally available for HTML inline onclick handlers
window.openModal = function(type) {
    document.getElementById('txnType').value = type;
    document.getElementById('modalTitle').innerText = type === 'earning' ? 'Add Income' : 'Add Expense';
    document.getElementById('txnAmount').value = '';
    document.getElementById('txnNote').value = '';
    document.getElementById('txnDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('txnModal').classList.remove('hidden');
    document.getElementById('txnModal').classList.add('flex');
}

window.closeModal = function() {
    document.getElementById('txnModal').classList.remove('flex');
    document.getElementById('txnModal').classList.add('hidden');
}

window.handleFormSubmit = function(event) {
    event.preventDefault();
    const type = document.getElementById('txnType').value;
    const amount = parseFloat(document.getElementById('txnAmount').value);
    const note = document.getElementById('txnNote').value;
    const date = document.getElementById('txnDate').value;

    transactions.unshift({
        id: Date.now(),
        type,
        amount,
        note,
        date,
        tag: document.getElementById('txnTag').value
    });

    saveToStorage();
    closeModal();
}

window.deleteTxn = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
}

window.setFilter = function(filter) {
    currentFilter = filter;
    showAllTransactions = false; // Reset pagination toggle on filter change
    ['all', 'expense', 'earning'].forEach(f => {
        const btn = document.getElementById(`filter${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (btn) {
            if (f === filter) {
                btn.className = "px-2.5 py-1 rounded-md bg-[#BF5B3E] text-white transition font-medium";
            } else {
                btn.className = "px-2.5 py-1 rounded-md text-[#7A6962] hover:text-[#2D2421] transition";
            }
        }
    });
    renderList();
};

window.filterByTag = function(tagName) {
    currentFilter = tagName;
    showAllTransactions = false;
    // Reset top filters visual highlight
    ['all', 'expense', 'earning'].forEach(f => {
        const btn = document.getElementById(`filter${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (btn) {
            btn.className = "px-2.5 py-1 rounded-md text-[#7A6962] hover:text-[#2D2421] transition";
        }
    });
    renderList();
};

window.toggleShowAllTransactions = function() {
    showAllTransactions = !showAllTransactions;
    renderList();
};

function renderSummary() {
    const totalIncome = transactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    document.getElementById('totalIncome').innerText = `₹${totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('totalExpense').innerText = `₹${totalExpense.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('netBalance').innerText = `₹${netBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    
    // Update center core of spinning wheel with total expenses
    const centerSpentEl = document.getElementById('centerSpent');
    if (centerSpentEl) {
        centerSpentEl.innerText = `₹${totalExpense.toLocaleString('en-IN')}`;
    }

    // Calculate budget percentage dynamically using user-defined budgetLimit
    const percentage = budgetLimit > 0 ? Math.min(Math.round((totalExpense / budgetLimit) * 100), 100) : 0;
    const limitFormatted = `₹${budgetLimit.toLocaleString('en-IN')}`;
    const spentFormatted = `₹${totalExpense.toLocaleString('en-IN')}`;
    
    // Update budget limit text and spent status dynamically in the DOM
    document.getElementById('budgetLimitText').innerText = limitFormatted;
    document.getElementById('budgetSpentText').innerText = `${spentFormatted} / ${limitFormatted}`;
    
    // Update budget progress bar width and color based on usage threshold (>85% turns terracotta)
    const bar = document.getElementById('budgetBar');
    bar.style.width = `${percentage}%`;
    bar.className = percentage > 85 ? "bg-[#BF5B3E] h-full rounded-full transition-all duration-500" : "bg-[#437158] h-full rounded-full transition-all duration-500";
}

function renderList() {
    const listContainer = document.getElementById('transactionList');
    listContainer.innerHTML = '';

    const filtered = transactions.filter(t => {
        if (currentFilter === 'expense') return t.type === 'expense';
        if (currentFilter === 'earning') return t.type === 'earning';
        if (['Food', 'Travel', 'Bills', 'Gaming', 'Stationary', 'General'].includes(currentFilter)) {
            return t.tag === currentFilter;
        }
        return true;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-6 text-[#7A6962] text-xs">No transactions found</div>`;
        return;
    }

    const displayList = showAllTransactions ? filtered : filtered.slice(0, 5);

    displayList.forEach(t => {
        const isExpense = t.type === 'expense';
        const card = document.createElement('div');
        card.className = "bg-[#F4EFEA] border border-[#D4C5B9] rounded-xl p-3.5 flex justify-between items-center shadow-sm hover:border-[#BFA896] transition";
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center ${isExpense ? 'bg-[#BF5B3E]/15 text-[#BF5B3E]' : 'bg-[#437158]/15 text-[#437158]'} font-bold">
                    ${isExpense ? '↓' : '↑'}
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-[#2D2421]">${t.note} <span class="text-[10px] text-[#7A6962] bg-[#ECE4DC] px-1.5 py-0.5 rounded ml-1">${t.tag || 'General'}</span></span>
                    <span class="text-[11px] text-[#7A6962]">${t.date}</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold ${isExpense ? 'text-[#BF5B3E]' : 'text-[#437158]'}">${isExpense ? '-' : '+'}₹${t.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                <button onclick="deleteTxn(${t.id})" class="text-[#8C7870] hover:text-[#BF5B3E] text-xs transition">✕</button>
            </div>
        `;
        listContainer.appendChild(card);
    });

    // See More / See Less toggle button if more than 5 items
    if (filtered.length > 5) {
        const btnContainer = document.createElement('div');
        btnContainer.className = "flex justify-center pt-1";
        btnContainer.innerHTML = `
            <button onclick="toggleShowAllTransactions()" class="text-xs font-semibold text-[#BF5B3E] hover:text-[#a84d33] bg-[#F4EFEA] border border-[#D4C5B9] px-4 py-2 rounded-xl shadow-sm transition">
                ${showAllTransactions ? 'Show Less ⌃' : `See More (${filtered.length - 5} more) ⌄`}
            </button>
        `;
        listContainer.appendChild(btnContainer);
    }
}

function renderChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (currentChartMode === 'monthly') {
        // Group by Year-Month (e.g. "2026-01", "2026-02")
        const monthMap = {};
        transactions.forEach(t => {
            if (!t.date) return;
            const ym = t.date.substring(0, 7); // YYYY-MM
            if (!monthMap[ym]) monthMap[ym] = { earning: 0, expense: 0 };
            if (t.type === 'earning') monthMap[ym].earning += t.amount;
            if (t.type === 'expense') monthMap[ym].expense += t.amount;
        });

        const sortedMonths = Object.keys(monthMap).sort();

        if (currentChartType === 'comparison') {
            const earningData = sortedMonths.map(m => monthMap[m].earning);
            const expenseData = sortedMonths.map(m => monthMap[m].expense);

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedMonths.length ? sortedMonths : ['No Data'],
                    datasets: [
                        {
                            label: 'Earnings (₹)',
                            data: sortedMonths.length ? earningData : [0],
                            backgroundColor: '#437158',
                            borderRadius: 4
                        },
                        {
                            label: 'Expenses (₹)',
                            data: sortedMonths.length ? expenseData : [0],
                            backgroundColor: '#BF5B3E',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#2D2421' } }
                    },
                    scales: {
                        x: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } },
                        y: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } }
                    }
                }
            });
        } else {
            const targetType = currentChartType === 'earnings' ? 'earning' : 'expense';
            const dataValues = sortedMonths.map(m => monthMap[m][targetType]);

            const color = targetType === 'earning' ? '#437158' : '#BF5B3E';
            const bgColor = targetType === 'earning' ? 'rgba(67, 113, 88, 0.1)' : 'rgba(191, 91, 62, 0.1)';

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedMonths.length ? sortedMonths : ['No Data'],
                    datasets: [{
                        label: targetType === 'earning' ? 'Monthly Earnings (₹)' : 'Monthly Expenses (₹)',
                        data: sortedMonths.length ? dataValues : [0],
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#2D2421' } } },
                    scales: {
                        x: { ticks: { color: '#7A6962', font: { size: 10 } }, grid: { color: '#D4C5B9' } },
                        y: { ticks: { color: '#7A6962', font: { size: 10 } }, grid: { color: '#D4C5B9' } }
                    }
                }
            });
        }
    } else {
        // Daily Mode
        const dateMap = {};
        transactions.forEach(t => {
            if (!t.date) return;
            if (!dateMap[t.date]) dateMap[t.date] = { earning: 0, expense: 0 };
            if (t.type === 'earning') dateMap[t.date].earning += t.amount;
            if (t.type === 'expense') dateMap[t.date].expense += t.amount;
        });

        const sortedDates = Object.keys(dateMap).sort();

        if (currentChartType === 'comparison') {
            const earningData = sortedDates.map(d => dateMap[d].earning);
            const expenseData = sortedDates.map(d => dateMap[d].expense);

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedDates.length ? sortedDates : ['No Data'],
                    datasets: [
                        {
                            label: 'Earnings (₹)',
                            data: sortedDates.length ? earningData : [0],
                            backgroundColor: '#437158',
                            borderRadius: 4
                        },
                        {
                            label: 'Expenses (₹)',
                            data: sortedDates.length ? expenseData : [0],
                            backgroundColor: '#BF5B3E',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#2D2421' } }
                    },
                    scales: {
                        x: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } },
                        y: { ticks: { color: '#7A6962', font: { size: 9 } }, grid: { color: '#D4C5B9' } }
                    }
                }
            });
        } else {
            const targetType = currentChartType === 'earnings' ? 'earning' : 'expense';
            const dataValues = sortedDates.map(d => dateMap[d][targetType]);

            const color = targetType === 'earning' ? '#437158' : '#BF5B3E';
            const bgColor = targetType === 'earning' ? 'rgba(67, 113, 88, 0.1)' : 'rgba(191, 91, 62, 0.1)';

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedDates.length ? sortedDates : ['No Data'],
                    datasets: [{
                        label: targetType === 'earning' ? 'Daily Earnings (₹)' : 'Daily Expenses (₹)',
                        data: sortedDates.length ? dataValues : [0],
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#2D2421' } } },
                    scales: {
                        x: { ticks: { color: '#7A6962', font: { size: 10 } }, grid: { color: '#D4C5B9' } },
                        y: { ticks: { color: '#7A6962', font: { size: 10 } }, grid: { color: '#D4C5B9' } }
                    }
                }
            });
        }
    }
}

function render() {
    renderSummary();
    renderList();
    renderChart();
}

// Initial render on load
if (document.getElementById('expenseChart')) {
    render();
}