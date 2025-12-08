// --- Navigation Logic ---
function switchTab(tabId) {
    // 1. Hide all sections
    const sections = ['dashboard', 'staff', 'tasks', 'chat'];
    sections.forEach(id => {
        document.getElementById(`view-${id}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${id}`);
        
        // Reset button styles
        navBtn.classList.remove('bg-primary/10', 'text-primary');
        navBtn.classList.add('text-slate-500', 'hover:bg-slate-50');
        
        // Reset icon fill
        const icon = navBtn.querySelector('.material-symbols-outlined');
        if(icon) icon.style.fontVariationSettings = "'FILL' 0";
    });

    // 2. Show selected section
    const activeSection = document.getElementById(`view-${tabId}`);
    activeSection.classList.remove('hidden');
    
    // 3. Highlight Sidebar Button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
    activeBtn.classList.add('bg-primary/10', 'text-primary');
    
    // Fill Icon
    const activeIcon = activeBtn.querySelector('.material-symbols-outlined');
    if(activeIcon) activeIcon.style.fontVariationSettings = "'FILL' 1";
}

// --- Task Modal Logic ---
function toggleTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

// Initialize Dashboard on load
document.addEventListener('DOMContentLoaded', () => {
    switchTab('dashboard');
});
