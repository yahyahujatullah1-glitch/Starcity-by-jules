// js/app.js

// --- 1. NAVIGATION ---
async function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('section[id^="view-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('animate-fade');
    });
    
    // Reset Nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary/10', 'text-primary');
        el.classList.add('text-slate-500', 'hover:bg-slate-50');
    });

    // Show View
    const view = document.getElementById(`view-${tabId}`);
    if(view) {
        view.classList.remove('hidden');
        view.classList.add('animate-fade');
    }

    // Highlight Nav
    const btn = document.getElementById(`nav-${tabId}`);
    if(btn) {
        btn.classList.add('bg-primary/10', 'text-primary');
        btn.classList.remove('text-slate-500');
    }

    await refreshData();
    if(tabId === 'staff') renderStaff();
    if(tabId === 'tasks') renderTasks();
    if(tabId === 'chat') renderChat();
    if(tabId === 'admin') renderAdmin();
}

// --- 2. RENDER FUNCTIONS ---
function renderStaff() {
    const tbody = document.getElementById('staff-table-body');
    tbody.innerHTML = '';
    db.staff.forEach(person => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-50">
                <td class="px-6 py-4 flex items-center gap-3">
                    <img src="${person.avatar}" class="h-9 w-9 rounded-full">
                    <span class="font-bold text-sm text-slate-900">${person.name}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-500">${person.role}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">Active</span></td>
                <td class="px-6 py-4"><button onclick="deleteStaff('${person.id}', '${person.name}')" class="text-red-500 hover:bg-red-50 p-1 rounded"><span class="material-symbols-outlined">delete</span></button></td>
            </tr>`;
    });
}

function renderTasks() {
    const tbody = document.getElementById('task-table-body');
    tbody.innerHTML = '';
    db.tasks.forEach(task => {
        let badge = task.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800';
        tbody.innerHTML += `
            <tr onclick="openTaskModal('${task.title}', '${task.priority}', '${task.status}')" class="hover:bg-slate-50 border-b border-slate-50 cursor-pointer">
                <td class="px-6 py-4 text-sm font-bold text-slate-900">${task.title}</td>
                <td class="px-6 py-4"><img src="${task.assignee_avatar}" class="h-8 w-8 rounded-full border-2 border-white"></td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-bold ${badge}">${task.status}</span></td>
                <td class="px-6 py-4 text-sm text-slate-500">${task.due}</td>
            </tr>`;
    });
}

function renderChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    db.chat.forEach(msg => {
        container.innerHTML += `
            <div class="flex gap-4 max-w-lg ${msg.isMe ? 'ml-auto flex-row-reverse' : ''} mb-4">
                <img src="${msg.avatar}" class="h-8 w-8 rounded-full mt-1">
                <div class="space-y-1 ${msg.isMe ? 'items-end flex flex-col' : ''}">
                    <div class="flex items-baseline gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}">
                        <span class="font-bold text-sm text-slate-900">${msg.sender}</span>
                    </div>
                    <div class="bg-${msg.isMe ? 'primary' : 'slate-100'} p-3 rounded-2xl ${msg.isMe ? 'rounded-tr-none text-white' : 'rounded-tl-none text-slate-800'} text-sm shadow-sm break-words max-w-full">
                        ${msg.text}
                    </div>
                </div>
            </div>`;
    });
    // Fix scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function renderAdmin() {
    // 1. Users Table
    const tbody = document.getElementById('admin-user-table-body');
    if(tbody) {
        tbody.innerHTML = '';
        db.staff.forEach(user => {
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="px-6 py-4 font-bold text-sm">${user.name}</td>
                    <td class="px-6 py-4 text-sm">${user.role}</td>
                    <td class="px-6 py-4"><button onclick="deleteStaff('${user.id}', '${user.name}')" class="text-red-500 text-xs font-bold hover:underline">DELETE</button></td>
                </tr>`;
        });
    }

    // 2. Logs
    const logContainer = document.getElementById('audit-log-container');
    if(logContainer) {
        logContainer.innerHTML = '';
        db.logs.forEach(log => {
            logContainer.innerHTML += `
                <div class="text-xs text-slate-400 border-b border-slate-700 py-1 font-mono">
                    <span class="text-green-400">[${new Date(log.created_at).toLocaleTimeString()}]</span> ${log.action}
                </div>
            `;
        });
    }
}

// --- 3. EVENT HANDLERS ---
async function handleAddStaff(e) {
    e.preventDefault();
    const name = document.getElementById('new-staff-name').value;
    const role = document.getElementById('new-staff-role').value;
    const email = document.getElementById('new-staff-email').value;
    
    await addStaffDB({ name, role, email });
    toggleModal('add-staff-modal');
    switchTab('staff');
}

async function deleteStaff(id, name) {
    if(confirm(`Delete ${name}?`)) {
        await deleteStaffDB(id, name);
        switchTab('staff');
    }
}

async function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('new-task-title').value;
    const due = document.getElementById('new-task-date').value;
    
    await addTaskDB({ title, due_date: due });
    toggleModal('add-task-modal');
    switchTab('tasks');
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    await sendChatDB(input.value);
    input.value = '';
    // Realtime listener in db.js will update UI
}

// --- 4. PROOF LINK LOGIC ---
function openTaskModal(title, priority, status) {
    const titleInput = document.getElementById('task-detail-title');
    const statusLabel = document.getElementById('task-detail-status');
    if(titleInput) titleInput.value = title;
    if(statusLabel) statusLabel.innerText = status;
    
    // Clear old links
    const list = document.getElementById('proof-list');
    if(list) list.innerHTML = '';

    toggleModal('task-detail-modal');
}

function saveProofLink() {
    const link = document.getElementById('proof-link-input').value;
    if(link) {
        const container = document.getElementById('proof-list');
        container.innerHTML += `
            <div class="p-3 border rounded-xl flex items-center gap-4 bg-slate-50 mt-2 animate-fade">
                <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded"><span class="material-symbols-outlined">link</span></div>
                <div class="flex-1 overflow-hidden"><a href="${link}" target="_blank" class="font-bold text-sm text-blue-600 hover:underline truncate block w-48">${link}</a></div>
                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">Pending</span>
            </div>
        `;
        document.getElementById('proof-link-input').value = '';
    }
}

function toggleModal(id) { 
    const el = document.getElementById(id);
    if(el) el.classList.toggle('hidden'); 
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    switchTab('dashboard');
    const chatInput = document.getElementById('chat-input');
    if(chatInput) {
        chatInput.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
    }
});
