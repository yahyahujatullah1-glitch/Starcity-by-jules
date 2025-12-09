// js/app.js

// --- 1. GLOBAL STATE & NAVIGATION ---
const db = getDB(); 

function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('section[id^="view-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('animate-fade');
    });
    
    // Reset Nav Buttons
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary/10', 'text-primary');
        el.classList.add('text-slate-500', 'hover:bg-slate-50');
        const icon = el.querySelector('.material-symbols-outlined');
        if(icon) icon.style.fontVariationSettings = "'FILL' 0";
    });

    // Show active view
    const activeView = document.getElementById(`view-${tabId}`);
    activeView.classList.remove('hidden');
    activeView.classList.add('animate-fade');

    // Highlight Button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
    activeBtn.classList.add('bg-primary/10', 'text-primary');
    const activeIcon = activeBtn.querySelector('.material-symbols-outlined');
    if(activeIcon) activeIcon.style.fontVariationSettings = "'FILL' 1";

    // Data Loaders
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'staff') renderStaff();
    if(tabId === 'tasks') renderTasks();
    if(tabId === 'chat') renderChat();
    if(tabId === 'admin') renderAdmin();
}

// --- 2. DASHBOARD ---
function renderDashboard() {
    document.getElementById('stat-total-staff').innerText = db.staff.length;
    document.getElementById('stat-active-tasks').innerText = db.tasks.filter(t => t.status !== 'Done').length;
    
    // Check Settings
    const banner = document.getElementById('maintenance-banner');
    if(db.settings.maintenanceMode) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
}

// --- 3. STAFF ---
function renderStaff() {
    const tbody = document.getElementById('staff-table-body');
    tbody.innerHTML = ''; 

    db.staff.forEach(person => {
        const row = `
            <tr class="hover:bg-slate-50 border-b border-slate-50">
                <td class="px-6 py-4 flex items-center gap-3">
                    <img src="${person.avatar}" class="h-9 w-9 rounded-full">
                    <span class="font-bold text-sm text-slate-900">${person.name}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-500">${person.role}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${person.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-800'}">
                        ${person.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteStaff(${person.id})" class="text-slate-400 hover:text-red-500 transition">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function handleAddStaff(e) {
    e.preventDefault();
    const name = document.getElementById('new-staff-name').value;
    const role = document.getElementById('new-staff-role').value;
    const email = document.getElementById('new-staff-email').value;

    const newStaff = { id: Date.now(), name, role, email, status: 'Active', avatar: `https://i.pravatar.cc/150?u=${Date.now()}` };

    db.staff.unshift(newStaff);
    saveDB(db);
    addAuditLog(`Added new staff member: ${name}`);
    renderStaff();
    toggleModal('add-staff-modal');
    e.target.reset();
}

function deleteStaff(id) {
    if(confirm("Delete this user? This will be logged.")) {
        const user = db.staff.find(s => s.id === id);
        db.staff = db.staff.filter(s => s.id !== id);
        saveDB(db);
        addAuditLog(`Deleted staff member: ${user.name}`);
        renderStaff();
    }
}

// --- 4. TASKS ---
function renderTasks() {
    const tbody = document.getElementById('task-table-body');
    tbody.innerHTML = '';

    db.tasks.forEach(task => {
        let badgeColor = 'bg-slate-100 text-slate-800';
        if(task.status === 'In Progress') badgeColor = 'bg-yellow-100 text-yellow-800';
        if(task.status === 'Done') badgeColor = 'bg-green-100 text-green-700';

        const row = `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="px-6 py-4 text-sm font-semibold text-slate-900">${task.title}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}">${task.status}</span></td>
                <td class="px-6 py-4 text-sm text-slate-500">${task.priority}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('new-task-title').value;
    const due = document.getElementById('new-task-date').value;
    
    db.tasks.unshift({ id: Date.now(), title, status: "Todo", priority: "Medium", due, assignee: [1] });
    saveDB(db);
    addAuditLog(`Created task: ${title}`);
    renderTasks();
    toggleModal('add-task-modal');
    e.target.reset();
}

// --- 5. CHAT ---
function renderChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `<div class="flex justify-center mb-4"><span class="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span></div>`;

    db.chat.forEach(msg => {
        const isMe = msg.isMe;
        container.innerHTML += `
            <div class="flex gap-4 max-w-lg ${isMe ? 'ml-auto flex-row-reverse' : ''} animate-fade">
                <img src="${msg.avatar}" class="h-8 w-8 rounded-full mt-1">
                <div class="space-y-1 ${isMe ? 'items-end flex flex-col' : ''}">
                    <div class="bg-${isMe ? 'primary' : 'slate-100'} p-3 rounded-2xl rounded-${isMe ? 'tr' : 'tl'}-none text-sm text-${isMe ? 'white' : 'slate-800'} shadow-sm">
                        ${msg.text}
                    </div>
                </div>
            </div>
        `;
    });
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;

    db.chat.push({ id: Date.now(), sender: "You", text: text, time: "Now", isMe: true, avatar: "https://i.pravatar.cc/150?u=admin" });
    saveDB(db);
    renderChat();
    input.value = '';

    setTimeout(() => {
        db.chat.push({ id: Date.now()+1, sender: "Jane Doe", text: "Got it! 👍", time: "Now", isMe: false, avatar: "https://i.pravatar.cc/150?img=41" });
        saveDB(db);
        renderChat();
    }, 1000);
}

// --- 6. ADMIN PANEL LOGIC ---

function renderAdmin() {
    // 1. Render Users Table
    const tbody = document.getElementById('admin-user-table-body');
    tbody.innerHTML = '';
    
    db.staff.forEach(user => {
        const isBanned = user.status === 'Banned';
        const roleColor = user.role === 'Admin' ? 'text-purple-600 bg-purple-100' : 'text-slate-600 bg-slate-100';
        
        const row = `
            <tr class="hover:bg-slate-50 border-b border-slate-100 ${isBanned ? 'opacity-50' : ''}">
                <td class="px-6 py-4 flex items-center gap-3">
                    <img src="${user.avatar}" class="h-8 w-8 rounded-full">
                    <div>
                        <p class="font-bold text-sm">${user.name}</p>
                        <p class="text-xs text-slate-400">${user.email}</p>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${roleColor}">${user.role}</span>
                </td>
                <td class="px-6 py-4 flex gap-2">
                    <button onclick="openEditUser(${user.id})" class="p-1 hover:bg-slate-200 rounded text-slate-500" title="Edit Role"><span class="material-symbols-outlined text-lg">edit</span></button>
                    <button onclick="deleteStaff(${user.id})" class="p-1 hover:bg-red-100 rounded text-red-500" title="Delete User"><span class="material-symbols-outlined text-lg">delete</span></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // 2. Render Audit Logs
    const logContainer = document.getElementById('audit-log-container');
    logContainer.innerHTML = '';
    db.auditLogs.forEach(log => {
        logContainer.innerHTML += `
            <div class="flex justify-between border-b border-slate-800 pb-1">
                <span class="text-green-400">[${log.time}]</span>
                <span class="text-white">${log.action}</span>
                <span class="text-slate-500">by ${log.user}</span>
            </div>
        `;
    });

    // 3. Set Toggles
    document.getElementById('setting-maintenance').checked = db.settings.maintenanceMode;
}

function openEditUser(id) {
    const user = db.staff.find(u => u.id === id);
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-status').value = user.status;
    toggleModal('admin-edit-modal');
}

function handleAdminUpdateUser(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-user-id').value);
    const newRole = document.getElementById('edit-user-role').value;
    const newStatus = document.getElementById('edit-user-status').value;

    // Update DB
    const userIndex = db.staff.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        db.staff[userIndex].role = newRole;
        db.staff[userIndex].status = newStatus;
        saveDB(db);
        addAuditLog(`Updated user ${db.staff[userIndex].name}: Role -> ${newRole}, Status -> ${newStatus}`);
        renderAdmin();
        toggleModal('admin-edit-modal');
    }
}

function toggleMaintenanceMode() {
    db.settings.maintenanceMode = !db.settings.maintenanceMode;
    saveDB(db);
    addAuditLog(`System Maintenance Mode set to ${db.settings.maintenanceMode}`);
    renderDashboard(); // To update the banner visibility
}

// --- UTILS ---
function toggleModal(modalId) {
    document.getElementById(modalId).classList.toggle('hidden');
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    switchTab('dashboard'); // Start on dashboard
    document.getElementById('chat-input').addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
});
