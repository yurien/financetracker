document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwx4HIu1VB-f-etIe3tzbF8zYsKCvQg0LTlnjVeBblkT9G40u4VBGSoRp4rWKlgod4heg/exec'; // Make sure your URL is here

    // --- ELEMENT REFERENCES ---
    const tbody = document.getElementById('transactionsTbody');
    const monthFilter = document.getElementById('monthFilter');
    const typeFilter = document.getElementById('typeFilter');
    const yearFilter = document.getElementById('yearFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    /**
     * Main function to fetch data and initialize the page.
     */
    async function loadPageData() {
        try {
            tbody.innerHTML = '<tr><td colspan="5" id="no-transactions">Loading transactions... <i class="fas fa-spinner fa-spin"></i></td></tr>';
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`Network error: ${response.statusText}`);
            }
            const allTransactions = await response.json();
            initializePage(allTransactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            tbody.innerHTML = '<tr><td colspan="5" id="no-transactions" style="color: var(--danger-accent);">Failed to load data. Please check the console.</td></tr>';
        }
    }

    /**
     * Sets up the page's summaries, filters, and event listeners after data has been fetched.
     * @param {Array} allTransactions - The array of transactions from the Google Sheet.
     */
    function initializePage(allTransactions) {
        
        // --- FUNCTIONS ---
        function renderTransactions(transactionsToRender) {
            tbody.innerHTML = '';
            let filteredIncome = 0, filteredExpense = 0;
            transactionsToRender.forEach(tx => {
                if (tx.type === 'Income') filteredIncome += parseFloat(tx.amount);
                else filteredExpense += parseFloat(tx.amount);
            });
            document.getElementById('totalIncomeFiltered').textContent = `₱ ${filteredIncome.toFixed(2)}`;
            document.getElementById('totalExpenseFiltered').textContent = `₱ ${filteredExpense.toFixed(2)}`;
            document.getElementById('netBalanceFiltered').textContent = `₱ ${(filteredIncome - filteredExpense).toFixed(2)}`;

            if (transactionsToRender.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" id="no-transactions">No transactions found for the selected filters.</td></tr>';
            } else {
                transactionsToRender.sort((a, b) => new Date(b.date) - new Date(a.date));
                transactionsToRender.forEach(tx => {
                    const tr = document.createElement('tr');
                    const typeClass = tx.type ? tx.type.toLowerCase() : 'expense';
                    tr.innerHTML = `
                        <td>${new Date(tx.date).toLocaleDateString()}</td>
                        <td>${tx.type}</td>
                        <td>${tx.category}</td>
                        <td class="amount ${typeClass}">${typeClass === 'expense' ? '-' : ''}₱ ${parseFloat(tx.amount).toFixed(2)}</td>
                        <td>${tx.description || 'N/A'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
        
        function displayAllTimeSummary() {
            let allTimeIncome = 0, allTimeExpense = 0;
            allTransactions.forEach(tx => {
                if (tx.type === 'Income') allTimeIncome += parseFloat(tx.amount);
                else allTimeExpense += parseFloat(tx.amount);
            });
            document.getElementById('totalIncomeAll').textContent = `₱ ${allTimeIncome.toFixed(2)}`;
            document.getElementById('totalExpenseAll').textContent = `₱ ${allTimeExpense.toFixed(2)}`;
            document.getElementById('netBalanceAll').textContent = `₱ ${(allTimeIncome - allTimeExpense).toFixed(2)}`;
        }

        // UPDATED function to build all dynamic filters
        function populateFilters() {
            const years = [...new Set(allTransactions.map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => b - a);
            const months = [...new Set(allTransactions.map(tx => new Date(tx.date).getMonth()))].sort((a, b) => a - b);
            const categories = [...new Set(allTransactions.map(tx => tx.category))].sort();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Clear existing options (except the 'All')
            yearFilter.innerHTML = '<option value="all">All Years</option>';
            monthFilter.innerHTML = '<option value="all">All Months</option>';
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';

            years.forEach(year => {
                yearFilter.add(new Option(year, year));
            });
            months.forEach(monthIndex => {
                monthFilter.add(new Option(monthNames[monthIndex], monthIndex));
            });
            categories.forEach(cat => {
                categoryFilter.add(new Option(cat, cat));
            });
        }

        function applyFilters() {
            const selectedMonth = monthFilter.value;
            const selectedType = typeFilter.value;
            const selectedYear = yearFilter.value;
            const selectedCategory = categoryFilter.value;
            let filteredTransactions = allTransactions;

            if (selectedYear !== 'all') {
                filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date).getFullYear() == selectedYear);
            }
            if (selectedMonth !== 'all') {
                filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date).getMonth() == selectedMonth);
            }
            if (selectedType !== 'all') {
                filteredTransactions = filteredTransactions.filter(tx => tx.type === selectedType);
               
            }
            if (selectedCategory !== 'all') {
                filteredTransactions = filteredTransactions.filter(tx => tx.category === selectedCategory);
            }
            renderTransactions(filteredTransactions);
        }

        // --- EVENT LISTENERS ---
        monthFilter.addEventListener('change', applyFilters);
        typeFilter.addEventListener('change', applyFilters);
        yearFilter.addEventListener('change', applyFilters);
        categoryFilter.addEventListener('change', applyFilters);
        
        resetFiltersBtn.addEventListener('click', () => {
            monthFilter.value = 'all';
            typeFilter.value = 'all';
            yearFilter.value = 'all';
            categoryFilter.value = 'all';
            renderTransactions(allTransactions);
        });

        // --- INITIALIZATION ---
        displayAllTimeSummary();
        populateFilters();
        renderTransactions(allTransactions);
    }
    
    // --- START THE APP ---
    loadPageData();
});