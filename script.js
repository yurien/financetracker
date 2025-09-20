document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwx4HIu1VB-f-etIe3tzbF8zYsKCvQg0LTlnjVeBblkT9G40u4VBGSoRp4rWKlgod4heg/exec';

    // --- ELEMENT REFERENCES ---
    const transactionForm = document.getElementById('transactionForm');
    const categorySelect = document.getElementById('category');
    const typeInput = document.getElementById('type');
    const descriptionTextarea = document.getElementById('description');
    const expenseOptGroup = document.getElementById('expense-options');
    const incomeOptGroup = document.getElementById('income-options');
    
    // Modal Elements
    const openManageModalBtn = document.getElementById('openManageModalBtn');
    const manageCategoryModal = document.getElementById('manageCategoryModal');
    const closeBtn = document.querySelector('.close-btn');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const removeCategoryForm = document.getElementById('removeCategoryForm');
    const categoryToRemoveSelect = document.getElementById('categoryToRemove');
    const removeExpenseOptGroup = document.getElementById('remove-expense-options');
    const removeIncomeOptGroup = document.getElementById('remove-income-options');
    
    let categoryData = { expense: [], income: [] };

    // --- INITIALIZATION ---
    document.getElementById('date').valueAsDate = new Date();

    async function initializePage() {
        await fetchAndPopulateCategories();
    }

    async function fetchAndPopulateCategories() {
        try {
            const response = await fetch(`${SCRIPT_URL}?action=getCategories`);
            if (!response.ok) throw new Error('Failed to fetch categories.');
            categoryData = await response.json();
            
            // Populate main form dropdown
            expenseOptGroup.innerHTML = '';
            incomeOptGroup.innerHTML = '';
            categoryData.expense.sort().forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; expenseOptGroup.appendChild(o); });
            categoryData.income.sort().forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; incomeOptGroup.appendChild(o); });
            
            // Populate remove category dropdown
            removeExpenseOptGroup.innerHTML = '';
            removeIncomeOptGroup.innerHTML = '';
            categoryData.expense.sort().forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; removeExpenseOptGroup.appendChild(o); });
            categoryData.income.sort().forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; removeIncomeOptGroup.appendChild(o); });

        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Could not load categories from the spreadsheet.');
        }
    }

    // --- GENERIC POST FUNCTION ---
    async function postData(action, payload) {
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            const data = await response.json();
            if (data.result !== 'success') throw new Error(data.error?.message || 'Unknown error');
            return data;
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    // --- EVENT LISTENERS ---
    transactionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            date: transactionForm.date.value,
            category: categorySelect.value,
            type: typeInput.value,
            amount: parseFloat(transactionForm.amount.value).toFixed(2),
            description: descriptionTextarea.value
        };
        const result = await postData('addTransaction', payload);
        if (result?.result === 'success') {
            alert('Transaction saved!');
            transactionForm.reset();
            typeInput.value = '';
            document.getElementById('date').valueAsDate = new Date();
        }
    });

    addCategoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            category: document.getElementById('newCategoryName').value.trim(),
            type: document.querySelector('input[name="newCategoryType"]:checked').value
        };
        if (!payload.category) { alert('Category name cannot be empty.'); return; }
        
        const result = await postData('addCategory', payload);
        if (result?.result === 'success') {
            alert('Category added!');
            addCategoryForm.reset();
            await fetchAndPopulateCategories(); // Refresh dropdowns
        }
    });

    removeCategoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = { category: categoryToRemoveSelect.value };
        if (!payload.category) { alert('Please select a category to remove.'); return; }
        if (!confirm(`Are you sure you want to remove "${payload.category}"?`)) return;

        const result = await postData('removeCategory', payload);
        if (result?.result === 'success') {
            alert('Category removed!');
            await fetchAndPopulateCategories(); // Refresh dropdowns
        }
    });

    categorySelect.addEventListener('change', (e) => {
        const cat = e.target.value;
        if (categoryData.income.includes(cat)) { typeInput.value = 'Income'; } 
        else if (categoryData.expense.includes(cat)) { typeInput.value = 'Expense'; } 
        else { typeInput.value = ''; }
    });
    
    descriptionTextarea.addEventListener('input', () => {
        descriptionTextarea.style.height = 'auto';
        descriptionTextarea.style.height = `${descriptionTextarea.scrollHeight}px`;
    });

    // Modal Controls
    openManageModalBtn.addEventListener('click', () => { manageCategoryModal.style.display = 'flex'; });
    closeBtn.addEventListener('click', () => { manageCategoryModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == manageCategoryModal) { manageCategoryModal.style.display = 'none'; } });

    // --- START THE APP ---
    initializePage();
});