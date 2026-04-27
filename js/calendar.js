/**
 * Calendar / Heatmap Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data
    window.AppStore.loadState();
    
    // 2. Apply Theme
    applyTheme();
    
    // 3. Render Heatmap
    renderHeatmap();
    
    // 4. Render Stats
    renderStats();
});

function applyTheme() {
    const theme = window.AppStore.state.settings.theme;
    document.body.classList.toggle('dark-mode', theme === 'dark');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

window.toggleTheme = function() {
    const currentState = window.AppStore.state.settings.theme;
    window.AppStore.state.settings.theme = currentState === 'light' ? 'dark' : 'light';
    window.AppStore.saveState();
    applyTheme();
};

function getActivityData() {
    const dates = window.AppStore.getAllCompletionDates();
    const data = {};
    dates.forEach(d => {
        data[d] = (data[d] || 0) + 1;
    });
    return data;
}

function renderHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    const activityData = getActivityData();
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 371; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const count = activityData[dateStr] || 0;
        let level = 0;
        if (count > 0) {
            level = 1;
            if (count >= 3) level = 2;
            if (count >= 6) level = 3;
            if (count >= 10) level = 4;
        }
        const cell = document.createElement('div');
        const isToday = dateStr === today.toISOString().split('T')[0];
        cell.className = `day-cell level-${level} ${isToday ? 'today' : ''}`;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} item(s)`;
        
        cell.appendChild(tooltip);
        container.appendChild(cell);
    }
}

function renderStats() {
    const stats = window.AppStore.calculateProgress();
    const data = getActivityData();
    const keys = Object.keys(data).sort();
    
    document.getElementById('totalTopics').innerText = stats.completed;
    document.getElementById('focusScore').innerText = `${stats.percent}%`;
    document.getElementById('currentStreak').innerText = `${window.AppStore.state.settings.streak} Days`;

    // Max streak calculation
    let maxStreak = 0;
    let tempStreak = 0;
    let last = null;
    keys.forEach(k => {
        if (!last) { tempStreak = 1; } 
        else {
            const diff = (new Date(k) - new Date(last)) / (1000*60*60*24);
            if (diff === 1) tempStreak++;
            else tempStreak = 1;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
        last = k;
    });

    const maxStreakEl = document.getElementById('maxStreak');
    if (maxStreakEl) maxStreakEl.innerText = maxStreak;

    const insight = document.getElementById('insightBox');
    if (insight) {
        if (window.AppStore.state.settings.streak > 0) {
            insight.innerHTML = `<i class="fas fa-bolt"></i> Keep it going! You are building a <strong>${window.AppStore.state.settings.streak}-day momentum</strong>. Don't break the chain!`;
        } else if (stats.completed > 0) {
            insight.innerHTML = `<i class="fas fa-lightbulb"></i> You've mastered <strong>${stats.completed} topics</strong> so far. Revisit the tracker to log today's progress!`;
        }
    }
}
