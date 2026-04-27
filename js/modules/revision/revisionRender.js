/**
 * Revision UI Rendering
 */

const RevisionRender = {
    container: document.getElementById('revisionList'),

    renderAll() {
        const topics = window.AppStore.state.revisionTopics;
        const container = this.container;
        
        // Add Agenda at the top
        container.innerHTML = this.renderDailyAgenda(topics);

        if (!topics || topics.length === 0) {
            container.innerHTML += `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-history" style="font-size: 3rem; opacity: 0.2; margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-dim-light);">No revision topics yet. Add one to start your spaced repetition journey.</p>
                </div>
            `;
            return;
        }

        const listDiv = document.createElement('div');
        listDiv.style.marginTop = '2rem';
        
        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.marginBottom = '1.5rem';
            card.style.border = '1px solid var(--border-light)';

            const dates = window.AppStore.generateRevisionDates(topic.createdDate);
            const today = new Date().toISOString().split('T')[0];
            const completedSessions = topic.completedSessions || {};

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--primary); font-size: 1.1rem;">
                        <i class="fas fa-book-open" style="margin-right: 0.5rem;"></i> ${topic.title}
                    </h3>
                    <button class="btn btn-ghost" style="color: #ef4444; padding: 4px;" onclick="RevisionHandlers.handleDelete('${topic.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-dim-light); margin-bottom: 1rem; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-calendar-plus"></i> Tracking since ${new Date(topic.createdDate).toLocaleDateString()}
                </div>
                <div style="overflow-x: auto; border: 1px solid var(--border-light); border-radius: 0.75rem;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                        <thead>
                            <tr style="text-align: left; background: rgba(99, 102, 241, 0.03);">
                                <th style="padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border-light); color: var(--text-dim-light); font-weight: 600;">#</th>
                                <th style="padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border-light); border-left: 1px solid var(--border-light); color: var(--text-dim-light); font-weight: 600;">Revision Date</th>
                                <th style="padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border-light); border-left: 1px solid var(--border-light); color: var(--text-dim-light); font-weight: 600;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dates.map((date, idx) => {
                                const isPast = date < today;
                                const isToday = date === today;
                                const isDone = !!completedSessions[idx];
                                
                                let statusHtml = '';
                                if (isDone) {
                                    statusHtml = `
                                        <button class="btn" style="background: #22c55e; color: white; border-radius: 20px; padding: 4px 12px; font-size: 0.65rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="RevisionHandlers.toggleSession('${topic.id}', ${idx})">
                                            <i class="fas fa-check-circle"></i> Completed
                                        </button>
                                    `;
                                } else {
                                    let btnStyle = 'background: #e2e8f0; color: #64748b; border: 1px solid transparent;';
                                    let label = 'Pending';
                                    
                                    if (isToday) {
                                        btnStyle = 'background: rgba(34, 197, 94, 0.1); color: #166534; border: 1px solid #22c55e;';
                                        label = 'Mark as Done';
                                    } else if (isPast) {
                                        btnStyle = 'background: rgba(239, 68, 68, 0.1); color: #991b1b; border: 1px solid #ef4444;';
                                        label = 'Overdue - Do Now';
                                    }

                                    statusHtml = `
                                        <button class="btn" style="${btnStyle} border-radius: 20px; padding: 4px 12px; font-size: 0.65rem; cursor: pointer; transition: transform 0.2s;" 
                                            onclick="RevisionHandlers.toggleSession('${topic.id}', ${idx})" 
                                            onmouseover="this.style.transform='scale(1.05)'" 
                                            onmouseout="this.style.transform='scale(1)'">
                                            ${label}
                                        </button>
                                    `;
                                }

                                return `
                                    <tr style="${isToday && !isDone ? 'background: rgba(34, 197, 94, 0.03);' : ''}">
                                        <td style="padding: 0.6rem 0.75rem; border-bottom: ${idx === dates.length - 1 ? 'none' : '1px solid var(--border-light)'}; font-weight: 600; ${isDone ? 'opacity: 0.5;' : ''}">${idx + 1}</td>
                                        <td style="padding: 0.6rem 0.75rem; border-bottom: ${idx === dates.length - 1 ? 'none' : '1px solid var(--border-light)'}; border-left: 1px solid var(--border-light); ${isDone ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${new Date(date).toLocaleDateString()}</td>
                                        <td style="padding: 0.6rem 0.75rem; border-bottom: ${idx === dates.length - 1 ? 'none' : '1px solid var(--border-light)'}; border-left: 1px solid var(--border-light);">${statusHtml}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            listDiv.appendChild(card);
        });
        container.appendChild(listDiv);
    },

    renderDailyAgenda(topics) {
        if (!topics || topics.length === 0) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const dueToday = [];
        const overdue = [];

        topics.forEach(topic => {
            const dates = window.AppStore.generateRevisionDates(topic.createdDate);
            const comp = topic.completedSessions || {};
            
            dates.forEach((date, idx) => {
                if (comp[idx]) return; // Skip completed

                if (date === today) {
                    dueToday.push({ topic, idx });
                } else if (date < today) {
                    overdue.push({ topic, idx });
                }
            });
        });

        if (dueToday.length === 0 && overdue.length === 0) {
            return `
                <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent); border: 1px solid var(--primary); margin-bottom: 2rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;"><i class="fas fa-check-circle" style="color: var(--primary)"></i> All caught up!</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-dim-light)">No pending revisions for today. Keep up the high standard!</p>
                </div>
            `;
        }

        return `
            <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.05)); border: 2px solid var(--primary); margin-bottom: 2rem; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.05; transform: rotate(15deg);">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <h2 style="margin: 0 0 1.2rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-bolt" style="color: #f59e0b;"></i> Daily Agenda
                </h2>
                
                ${dueToday.length > 0 ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.8rem; text-transform: uppercase; color: #22c55e; letter-spacing: 0.05em;">Recommended for Today</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${dueToday.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.5); padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                                    <span style="font-weight: 600; font-size: 0.9rem;">${item.topic.title}</span>
                                    <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.7rem; border-radius: 8px;" onclick="RevisionHandlers.toggleSession('${item.topic.id}', ${item.idx})">Done</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${overdue.length > 0 ? `
                    <div>
                        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.8rem; text-transform: uppercase; color: #ef4444; letter-spacing: 0.05em;">Critical Overdue</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${overdue.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.05); padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                                    <span style="font-weight: 600; font-size: 0.9rem; color: #991b1b;">${item.topic.topic.title}</span>
                                    <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.7rem; border-radius: 8px;" onclick="RevisionHandlers.toggleSession('${item.topic.topic.id}', ${item.idx})">Revise Now</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <p style="margin-top: 1.25rem; font-size: 0.7rem; color: var(--text-dim-light); font-style: italic; opacity: 0.8;">
                    Click "Done" to update your mastery progress. Every session counts.
                </p>
            </div>
        `;
    }
};

window.RevisionRender = RevisionRender;
