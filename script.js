document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('cost-form');
    const itemName = document.getElementById('item-name');
    const quantity = document.getElementById('quantity');
    const unit = document.getElementById('unit');
    const price = document.getElementById('price');
    const category = document.getElementById('category');
    const addButton = document.getElementById('add-button');
    const updateButton = document.getElementById('update-button');
    const resetButton = document.getElementById('reset-button');
    const newButton = document.getElementById('new-button');
    const tableBody = document.querySelector('#cost-table tbody');
    const totalEstimate = document.getElementById('total-estimate');
    const savedSessionsList = document.getElementById('saved-sessions');
    const searchInput = document.getElementById('search-input');
    
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let savedSessions = JSON.parse(localStorage.getItem('savedSessions')) || [];
    let editIndex = null; // Track the item being edited

    // Function to update the table
    function updateTable() {
        tableBody.innerHTML = ''; // Clear the existing table
        let total = 0; // Reset total for calculation

        items.forEach((item, index) => {
            const totalItemPrice = item.quantity * item.price;
            total += totalItemPrice;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td>₹${totalItemPrice}</td>
                <td>
                    <button class="btn edit-btn" onclick="editItem(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn delete-btn" onclick="deleteItem(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        totalEstimate.textContent = `₹${total}`;
        localStorage.setItem('items', JSON.stringify(items)); // Save updated items in localStorage
    }

    // Handle form submission for adding new item
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent page reload

        const newItem = {
            name: itemName.value,
            quantity: parseFloat(quantity.value),
            unit: unit.value,
            category: category.value,
            price: parseFloat(price.value),
        };

        if (editIndex === null) {
            // Add new item
            items.push(newItem);
        }

        updateTable(); // Refresh the table
        form.reset(); // Clear the form
    });

    // Update button click handler
    updateButton.addEventListener('click', function () {
        if (editIndex !== null) {
            // Update the existing item
            items[editIndex] = {
                name: itemName.value,
                quantity: parseFloat(quantity.value),
                unit: unit.value,
                category: category.value,
                price: parseFloat(price.value),
            };

            editIndex = null; // Reset the index
            updateTable(); // Refresh the table
            form.reset(); // Reset form after update
            updateButton.style.display = 'none'; // Hide the update button
            addButton.style.display = 'inline-block'; // Show add button
        }
    });

    // Edit item
    window.editItem = function (index) {
        const item = items[index];
        itemName.value = item.name;
        quantity.value = item.quantity;
        unit.value = item.unit;
        category.value = item.category;
        price.value = item.price;
        editIndex = index; // Set the item index being edited

        // Show update button, hide add button
        addButton.style.display = 'none';
        updateButton.style.display = 'inline-block';
    };

    // Delete item
    window.deleteItem = function (index) {
        items.splice(index, 1); // Remove the item from the list
        updateTable(); // Refresh the table
    };

    // Search functionality
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.unit.toLowerCase().includes(query) ||
            item.price.toString().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        renderTable(filteredItems); // Render filtered results
    });

    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear table
        let total = 0;

        data.forEach((item, index) => {
            const totalItemPrice = item.quantity * item.price;
            total += totalItemPrice;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td>₹${totalItemPrice}</td>
                <td>
                    <button class="btn edit-btn" onclick="editItem(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn delete-btn" onclick="deleteItem(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        totalEstimate.textContent = `₹${total}`;
    }

    // Reset functionality
    resetButton.addEventListener('click', function () {
        const sessionName = prompt("Enter a name for this session:");
        if (sessionName) {
            savedSessions.push({ name: sessionName, data: [...items] });
            localStorage.setItem('savedSessions', JSON.stringify(savedSessions)); // Save session
            displaySavedSessions(); // Update the left sidebar
        }
        items = []; // Clear current items
        updateTable(); // Reset table
        form.reset(); // Reset form
    });

    // Display saved sessions on the sidebar
    function displaySavedSessions() {
        savedSessionsList.innerHTML = '';
        savedSessions.forEach((session, index) => {
            const li = document.createElement('li');
            li.textContent = session.name;
            li.addEventListener('click', function () {
                items = session.data; // Load the saved session's data
                updateTable(); // Update the table with the saved session's data
            });
            savedSessionsList.appendChild(li);
        });
    }

    // New session functionality
    newButton.addEventListener('click', function () {
        items = []; // Clear current items
        updateTable(); // Reset table
        form.reset(); // Reset form
    });

    // Load saved sessions from localStorage
    displaySavedSessions();

    // Initialize the table when the page loads
    updateTable();

    // Download PDF report
    document.getElementById('download-report').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Cost Estimator Report", 20, 10);

        let data = items.map(item => [
            item.name, 
            item.quantity, 
            item.unit, 
            item.category, 
            `Rs. ${item.price}`, 
            `Rs. ${item.quantity * item.price}`
        ]);

        doc.autoTable({
            head: [['Item Name', 'Quantity', 'Unit', 'Category', 'Price (Rs.)', 'Total (Rs.)']],
            body: data,
        });

        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        doc.text(`Total Amount: Rs. ${total}`, 14, doc.lastAutoTable.finalY + 10);

        doc.save('Cost-Estimator-Report.pdf');
    });
});
