document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('transactionsTbody');
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // --- Calculate Totals (No changes here) ---
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(tx => {
        if (tx.type === 'Income') {
            totalIncome += parseFloat(tx.amount);
        } else {
            totalExpense += parseFloat(tx.amount);
        }
    });
    const netBalance = totalIncome - totalExpense;

    // --- Update Summary UI (No changes here) ---
    document.getElementById('totalIncome').textContent = `₱ ${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `₱ ${totalExpense.toFixed(2)}`;
    document.getElementById('netBalance').textContent = `₱ ${netBalance.toFixed(2)}`;

    // --- Display Transactions in Table ---
    if (transactions.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'No transactions found. Add one on the main page!';
        td.id = 'no-transactions';
        tr.appendChild(td);
        tbody.appendChild(tr);
    } else {
        // Sort transactions by date, newest first
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Create a table row for each transaction
        transactions.forEach(tx => {
            const tr = document.createElement('tr');
            const typeClass = tx.type.toLowerCase(); // 'income' or 'expense'

            tr.innerHTML = `
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td>${tx.type}</td>
                <td>${tx.category}</td>
                <td class="amount ${typeClass}">
                    ${typeClass === 'expense' ? '-' : ''}₱ ${tx.amount}
                </td>
                <td>${tx.description || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});