// src/reports.js — Financial Aggregation & Reporting Engine

const MONTH_NAMES = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

/**
 * Computes daily expense totals. 
 * Stripped strict current-month suffix filtering so that any expense logged by the user
 * is reliably aggregated and displayed in the spending overview chart.
 */
export function getDailySummary(transactions) {
    const totals = {};
    
    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (!t.date) return;

        try {
            const parts = t.date.split("-");
            let year, month, day;

            if (parts[0].length === 4) {
                // YYYY-MM-DD format (HTML date input)
                year = parts[0];
                month = parts[1];
                day = parts[2];
            } else {
                // DD-MM-YYYY format
                day = parts[0];
                month = parts[1];
                year = parts[2];
            }

            // Create a chronologically sortable key (YYYY-MM-DD)
            const sortKey = `${year}-${month}-${day}`;
            totals[sortKey] = (totals[sortKey] || 0) + t.amount;
        } catch (e) {
            // Skip invalid dates
        }
    });

    // Sort chronologically by date key
    const sortedEntries = Object.entries(totals).sort((a, b) => a[0].localeCompare(b[0]));

    // Map sorted entries to [formattedLabel, totalAmount] for Chart.js
    return sortedEntries.map(([dateKey, total]) => {
        const p = dateKey.split("-");
        const label = `${p[2]}-${p[1]}`; // Display as DD-MM
        return [label, total];
    });
}

/**
 * Computes monthly expense totals grouped strictly by Year and Month.
 */
export function getMonthlyExpenses(transactions) {
    const totals = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (!t.date) return;

        try {
            const parts = t.date.split("-");
            let year, month;

            if (parts[0].length === 4) {
                year = parts[0];
                month = parts[1];
            } else {
                month = parts[1];
                year = parts[2];
            }

            if (!year || !month) return;

            const key = `${year}-${month}`;
            totals[key] = (totals[key] || 0) + t.amount;
        } catch (e) {
            // Skip invalid dates
        }
    });

    const sortedKeys = Object.keys(totals).sort();

    return sortedKeys.map(key => {
        const [year, month] = key.split("-");
        const monthLabel = MONTH_NAMES[month] || month;
        return [`${monthLabel} ${year}`, totals[key]];
    });
}
