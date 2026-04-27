/**
 * Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data
    window.AppStore.loadState();
    
    // 2. Initialize Theme
    applyTheme();
    
    // 3. Initialize UI
    window.UI.init();
    
    // 4. Initialize Charts
    initCharts();
    
    // 5. Setup extra buttons
    setupExtras();
});

function applyTheme() {
    const theme = window.AppStore.state.settings.theme || 'light';
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

window.exportData = function() {
    const dataStr = JSON.stringify(window.AppStore.state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'mathquest_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

window.resetProgress = function() {
    if (confirm("DANGER: This will delete EVERYTHING. Are you sure?")) {
        localStorage.removeItem('mathquest_state');
        location.reload();
    }
};

let mainChart = null;
function initCharts() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const stats = window.AppStore.calculateProgress();
    
    mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [stats.completed, stats.left],
                backgroundColor: ['#6366f1', '#e2e8f0'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Make update function available to UI
    window.updateMainChart = (newStats) => {
        if (mainChart) {
            mainChart.data.datasets[0].data = [newStats.completed, newStats.left];
            mainChart.update();
        }
    };
}

function setupExtras() {
    // Add Category button in the sidebar or header
    // The user had a "+ Add Category" button in the brief. 
    // I'll add a way to trigger it from the UI or just ensure the button exists in HTML.
    
    // Quotes (Keep original feature)
    const quotes = [
        "Mathematics is the music of reason.",
        "To learn mathematics is to learn the language of the universe.",
        "Pure mathematics is, in its way, the poetry of logical ideas.",
        "In mathematics, the art of proposing a question must be held of higher value than solving it."
    ];
    const quoteBox = document.getElementById('quoteBox');
    if (quoteBox) {
        quoteBox.innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    }
}
