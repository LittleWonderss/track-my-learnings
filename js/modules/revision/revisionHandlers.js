/**
 * Revision Event Handlers
 */

const RevisionHandlers = {
    setup() {
        const addBtn = document.getElementById('addRevisionBtn');
        const input = document.getElementById('revisionInput');

        if (addBtn && input) {
            addBtn.onclick = () => this.handleAdd();
            input.onkeypress = (e) => {
                if (e.key === 'Enter') this.handleAdd();
            };
        }
    },

    handleAdd() {
        const input = document.getElementById('revisionInput');
        const title = input.value.trim();

        if (!title) return;

        window.AppStore.addRevisionTopic(title);
        input.value = '';
        window.RevisionRender.renderAll();
        
        // Show success toast if it exists
        if (window.UI && window.UI.showToast) {
            window.UI.showToast("Topic Added for Revision!");
        }
    },

    handleDelete(id) {
        if (confirm("Stop revision tracking for this topic?")) {
            window.AppStore.deleteRevisionTopic(id);
            window.RevisionRender.renderAll();
        }
    },

    toggleSession(topicId, sessionIndex) {
        window.AppStore.toggleRevisionSession(topicId, sessionIndex);
        window.RevisionRender.renderAll();
        
        const topic = window.AppStore.state.revisionTopics.find(t => t.id === topicId);
        const isDone = topic.completedSessions[sessionIndex];
        
        if (window.UI && window.UI.showToast) {
            window.UI.showToast(isDone ? "Revision Marked as Done!" : "Revision Reverted to Pending");
        }
    }
};

window.RevisionHandlers = RevisionHandlers;
