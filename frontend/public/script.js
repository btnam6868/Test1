console.log("Dashboard script loaded");

// Load users from API
async function loadUsers() {
    try {
        const response = await fetch('/api/users/list', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const users = await response.json();
        populateUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users: ' + error.message);
    }
}

function populateUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.first_name}</td>
            <td>${user.last_name}</td>
            <td>${user.role || 'No role'}</td>
            <td>
                <button onclick="editUser(${user.id})" class="btn-edit">Edit</button>
                <button onclick="deleteUser(${user.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize users table when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('usersTable')) {
        loadUsers();
    }
});

// Get the search input and table
const searchInput = document.getElementById('search-input');
const userTable = document.getElementById('user-table');

// Add event listener to the search input
searchInput.addEventListener('keyup', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = userTable.getElementsByTagName('tr');

    // Loop through all table rows, and hide those who don't match the search query
    for (let i = 1; i < tableRows.length; i++) { // Start from 1 to skip the header row
        const rowData = tableRows[i].textContent.toLowerCase();
        if (rowData.includes(searchTerm)) {
            tableRows[i].style.display = "";
        } else {
            tableRows[i].style.display = "none";
        }
    }
});

// Get the modal and button elements
const modal = document.getElementById('add-user-modal');
const addUserBtn = document.getElementById('add-user-btn');
const closeButton = document.querySelector('.close-button');

// Open the modal when the button is clicked
addUserBtn.addEventListener('click', function() {
    modal.style.display = "block";
});

// Close the modal when the close button is clicked
closeButton.addEventListener('click', function() {
    modal.style.display = "none";
});

// Close the modal when the user clicks outside of it
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// Handle form submission (This is just a placeholder - it won't actually save data)
const addUserForm = document.getElementById('add-user-form');
addUserForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the values from the input fields
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Here you would normally send the data to the server
    console.log("Creating user:", username, email, password);

    // For now, just close the modal
    modal.style.display = "none";
    addUserForm.reset();
});

// --- Placeholder functions for Add, Edit, Delete ---

function addUser(username, email, password) {
    console.log("Placeholder: Adding user", username, email, password);
    // In a real application, this would make an API call to the backend
    // Example:
    // axios.post('/api/users', { username, email, password })
    //   .then(response => { ... })
    //   .catch(error => { ... });
}

function editUser(userId) {
    console.log("Placeholder: Editing user", userId);
    // In a real application, this would open a modal with the user's data
    // and allow the user to edit it, then make an API call to update the data
}

function deleteUser(userId) {
    console.log("Placeholder: Deleting user", userId);
    // In a real application, this would make an API call to delete the user
}

// --- Attach event listeners to the table ---
const userTableBody = document.querySelector('#user-table tbody');
userTableBody.addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'A') {
        const userId = target.parentNode.parentNode.firstChild.textContent; // Get the user ID from the first cell
        if (target.textContent === 'Edit') {
            editUser(userId);
        } else if (target.textContent === 'Delete') {
            deleteUser(userId);
        }
    }
});
