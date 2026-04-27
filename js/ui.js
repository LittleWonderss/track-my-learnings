/**
 * UI Rendering & Interactivity
 */

const UI = {
  // Selectors
  topicsList: document.getElementById('topicsList'),
  percentVal: document.getElementById('percentVal'),
  leftVal: document.getElementById('leftVal'),
  topProgressFill: document.getElementById('topProgressFill'),
  streakVal: document.getElementById('streakVal'),
  itemsCount: document.getElementById('itemsCount'),
  nextRecommended: document.getElementById('nextRecommended'),
  
  // Modals
  notesModal: document.getElementById('notesModal'),
  modalTitle: document.getElementById('modalTitle'),
  noteText: document.getElementById('noteText'),
  targetDate: document.getElementById('targetDate'),
  
  // State for modals
  currentEditing: { catId: null, topicId: null },

  init() {
    this.renderAll();
    this.setupGlobalEvents();
  },

  renderAll() {
    this.renderCategories();
    this.updateStats();
    this.renderInsights();
  },

  renderCategories() {
    const categories = window.AppStore.state.categories;
    const container = this.topicsList;
    
    if (categories.length === 0) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-dim-light)">
          <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3"></i>
          <p>Start by adding your first category</p>
          <button class="btn btn-primary" onclick="UI.openCategoryModal()" style="margin-top: 1rem">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    categories.forEach(cat => {
      const sectionWrapper = document.createElement('div');
      sectionWrapper.className = 'section-wrapper active'; // Default to active/expanded
      sectionWrapper.id = `cat-wrapper-${cat.id}`;
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'section-title';
      titleDiv.innerHTML = `
        <div onclick="UI.toggleAccordion('${cat.id}')" style="flex:1">
          <i class="fas fa-chevron-down chevron"></i>
          <span>${cat.name}</span>
        </div>
        <div style="display:flex; gap: 10px; align-items: center">
          <button class="btn btn-ghost" style="padding: 4px 8px" onclick="UI.openTopicModal('${cat.id}')" title="Add Topic">
            <i class="fas fa-plus"></i>
          </button>
          <button class="btn btn-ghost" style="padding: 4px 8px; color: #ef4444" onclick="UI.confirmDeleteCategory('${cat.id}')" title="Delete Category">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'section-content';
      contentDiv.id = `cat-content-${cat.id}`;
      
      if (cat.topics.length === 0) {
        contentDiv.innerHTML = `<div style="padding: 1rem; font-size: 0.85rem; color: var(--text-dim-light); text-align:center">No topics yet</div>`;
      } else {
        cat.topics.forEach(topic => {
          const topicItem = document.createElement('div');
          topicItem.className = `topic-item ${topic.completed ? 'completed' : ''}`;
          
          topicItem.innerHTML = `
            <div class="checkbox-wrapper">
              <input type="checkbox" ${topic.completed ? 'checked' : ''} onchange="UI.handleTopicToggle('${cat.id}', '${topic.id}')">
            </div>
            <div style="flex: 1" onclick="UI.openNotesModal('${cat.id}', '${topic.id}')" style="cursor:pointer">
              <span>${topic.title}</span>
              ${topic.deadline ? `<br><small style="color:var(--primary); font-size: 0.7rem"><i class="fas fa-calendar-day"></i> ${topic.deadline}</small>` : ''}
              ${topic.notes ? ` <i class="fas fa-sticky-note" style="font-size:0.7rem; color:var(--text-dim-light)"></i>` : ''}
            </div>
            <div style="display:flex; gap: 5px">
              <button class="btn btn-ghost" style="padding: 2px 5px; font-size: 0.8rem" onclick="UI.openSubtopicModal('${cat.id}', '${topic.id}')" title="Add Subtopic">
                <i class="fas fa-level-down-alt"></i>
              </button>
              <button class="btn btn-ghost" style="padding: 2px 5px; font-size: 0.8rem" onclick="UI.confirmDeleteTopic('${cat.id}', '${topic.id}')" title="Delete Topic">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `;
          contentDiv.appendChild(topicItem);
          
          // Render Subtopics
          if (topic.subtopics && topic.subtopics.length > 0) {
            topic.subtopics.forEach(sub => {
              const subItem = document.createElement('div');
              subItem.className = `subtopic-item ${sub.completed ? 'completed' : ''}`;
              subItem.innerHTML = `
                <div class="checkbox-wrapper">
                  <input type="checkbox" ${sub.completed ? 'checked' : ''} onchange="UI.handleSubtopicToggle('${cat.id}', '${topic.id}', '${sub.id}')">
                </div>
                <div style="flex: 1">
                  <span>${sub.title}</span>
                </div>
                <button class="btn btn-ghost" style="padding: 2px 5px; font-size: 0.7rem" onclick="UI.confirmDeleteSubtopic('${cat.id}', '${topic.id}', '${sub.id}')">
                  <i class="fas fa-times"></i>
                </button>
              `;
              contentDiv.appendChild(subItem);
            });
          }
        });
      }
      
      sectionWrapper.appendChild(titleDiv);
      sectionWrapper.appendChild(contentDiv);
      container.appendChild(sectionWrapper);
    });
  },

  updateStats() {
    const stats = window.AppStore.calculateProgress();
    this.percentVal.innerText = `${stats.percent}%`;
    this.leftVal.innerText = stats.left;
    this.topProgressFill.style.width = `${stats.percent}%`;
    this.streakVal.innerText = window.AppStore.state.settings.streak;
    this.itemsCount.innerText = `${stats.total} items total`;
    
    // Update Chart if it exists
    if (window.updateMainChart) window.updateMainChart(stats);
  },

  renderInsights() {
    const categories = window.AppStore.state.categories;
    let next = null;
    
    // Find first incomplete topic
    for (const cat of categories) {
      for (const top of cat.topics) {
        if (!top.completed) {
          next = top;
          break;
        }
      }
      if (next) break;
    }
    
    if (next) {
      this.nextRecommended.innerHTML = `
        <div style="font-weight: 600; font-size: 0.9rem">${next.title}</div>
        <div style="font-size: 0.75rem; opacity: 0.8">Highly recommended to stay on track.</div>
      `;
    } else {
      this.nextRecommended.innerHTML = 'All caught up! 🎉 Add more topics to keep learning.';
    }
  },

  // Event Handlers
  toggleAccordion(catId) {
    const wrapper = document.getElementById(`cat-wrapper-${catId}`);
    wrapper.classList.toggle('active');
    wrapper.classList.toggle('collapsed');
  },

  handleTopicToggle(catId, topicId) {
    window.AppStore.toggleTopic(catId, topicId);
    this.renderAll();
    this.showToast("Progress Saved!");
  },

  handleSubtopicToggle(catId, topicId, subId) {
    window.AppStore.toggleSubtopic(catId, topicId, subId);
    this.renderAll();
    this.showToast("Subtopic Updated!");
  },

  // Modals & Prompts
  openCategoryModal() {
    const name = prompt("Enter Category Name:");
    if (name) {
      window.AppStore.addCategory(name);
      this.renderAll();
    }
  },

  confirmDeleteCategory(catId) {
    if (confirm("Are you sure you want to delete this category and all its topics?")) {
      window.AppStore.deleteCategory(catId);
      this.renderAll();
    }
  },

  openTopicModal(catId) {
    const title = prompt("Enter Topic Title:");
    if (title) {
      window.AppStore.addTopic(catId, title);
      this.renderAll();
    }
  },

  confirmDeleteTopic(catId, topicId) {
    if (confirm("Delete this topic?")) {
      window.AppStore.deleteTopic(catId, topicId);
      this.renderAll();
    }
  },

  openSubtopicModal(catId, topicId) {
    const title = prompt("Enter Subtopic Title:");
    if (title) {
      window.AppStore.addSubtopic(catId, topicId, title);
      this.renderAll();
    }
  },

  confirmDeleteSubtopic(catId, topicId, subId) {
    if (confirm("Delete this subtopic?")) {
      window.AppStore.deleteSubtopic(catId, topicId, subId);
      this.renderAll();
    }
  },

  openNotesModal(catId, topicId) {
    const cat = window.AppStore.state.categories.find(c => c.id === catId);
    const topic = cat.topics.find(t => t.id === topicId);
    
    this.currentEditing = { catId, topicId };
    this.modalTitle.innerText = `Notes for ${topic.title}`;
    this.noteText.value = topic.notes || "";
    this.targetDate.value = topic.deadline || "";
    this.notesModal.style.display = 'flex';
  },

  closeModal() {
    this.notesModal.style.display = 'none';
  },

  saveNote() {
    const { catId, topicId } = this.currentEditing;
    const notes = this.noteText.value;
    const deadline = this.targetDate.value;
    
    window.AppStore.updateTopicDetails(catId, topicId, notes, deadline);
    this.closeModal();
    this.renderAll();
    this.showToast("Notes Saved!");
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  },

  setupGlobalEvents() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.topic-item, .subtopic-item');
        items.forEach(item => {
          const text = item.innerText.toLowerCase();
          item.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }
    
    // Close modal on outside click
    window.onclick = (event) => {
      if (event.target == this.notesModal) {
        this.closeModal();
      }
    };
  }
};

window.UI = UI;
