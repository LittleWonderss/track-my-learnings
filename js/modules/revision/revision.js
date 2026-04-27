/**
 * Revision Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Global State
    window.AppStore.loadState();
    
    // 2. Initialize Theme
    const theme = window.AppStore.state.settings.theme;
    document.body.classList.toggle('dark-mode', theme === 'dark');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    // 3. Initialize Revision Module
    window.RevisionRender.renderAll();
    window.RevisionHandlers.setup();
});

window.toggleTheme = function() {
    const currentState = window.AppStore.state.settings.theme;
    window.AppStore.state.settings.theme = currentState === 'light' ? 'dark' : 'light';
    window.AppStore.saveState();
    
    document.body.classList.toggle('dark-mode', window.AppStore.state.settings.theme === 'dark');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = window.AppStore.state.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
};
