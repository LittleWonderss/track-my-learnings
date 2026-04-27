# Track-My-Learnings | Personal Learning Mastery Tracker

Track-My-Learnings is a professional, modern web application designed for self-paced learners to track, visualize, and master any learning journey. 

![Track-My-Learnings Logo](https://img.shields.io/badge/Track--My--Learnings-Learning-6366f1?style=for-the-badge&logo=graduationcap)
![Status](https://img.shields.io/badge/Status-Complete-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/Vanilla-JS-yellow?style=for-the-badge&logo=javascript)

## 🧠 Project Overview

The journey into any complex subject often feels overwhelming due to the sheer volume of prerequisites. **Track-My-Learnings** transforms this journey into an interactive adventure. It combines a structured curriculum tracker with a GitHub-style activity heatmap to drive accountability and provide a clear sense of progress.

### The Purpose
*   **Structured Path:** Organize any custom hierarchy of topics and subtopics.
*   **Visual Accountability:** Uses a contribution heatmap to encourage daily consistency.
*   **Data-Driven Mastery:** Real-time analytics, spaced repetition, and streak tracking keep learners motivated.

---

## 🧩 Core Features

### 1. Main Tracker (`index.html`)
The command center for your learning journey.
*   **Dynamic Hierarchy:** Create custom Categories, Topics, and Subtopics with full CRUD support.
*   **Interactive Accordions:** Clean UI that lets users focus on one section at a time while maintaining a bird's-eye view of total progress.
*   **Smart Analytics:** Integrated **Chart.js** doughnut charts and progress bars provide instant visual feedback on mastery.
*   **Topic Notes & Deadlines:** Users can attach personal notes and target completion dates to any topic via a modern modal interface.
*   **System Tools:** Dark mode toggle, project reset, and JSON export/import for data portability.

### 2. Activity Profile (`calendar.html`)
A dedicated dashboard for habit formation.
*   **GitHub-Style Heatmap:** A 365-day visualization of learning intensity. The colors transition from light to dark based on the number of topics mastered on a specific date.
*   **Streak System:** Automatically calculates current and all-time best streaks to gamify the learning experience.
*   **Performance Insights:** Smart banners suggest the next steps based on current momentum.

### 3. Spaced Repetition (`revision.html`)
Scientifically master your topics.
*   **Automatic Scheduling:** Enter a topic once and get a proven revision schedule (Day 1, 2, 3, 7, etc.).
*   **Daily Agenda:** A high-visibility dashboard showing what needs to be revised today.
*   **Progress Tracking:** Mark individual revision sessions as complete to stay on schedule.

---

## 🔄 Data Architecture

Track-My-Learnings is built on the philosophy of **Zero-Server Reliability**. All user data is stored locally, ensuring privacy and offline availability.

### How it Works:
1.  **LocalStorage Integration:** The entire application state (categories, revision topics, theme) is serialized into a single JSON object under the key `mathquest_state`.
2.  **Cross-Page Syncing:** All components use a centralized `AppStore` for state management and calculations.
3.  **Intensity Calculation:** The heatmap logic aggregates completed items by date to visualize learning intensity.

---

## 🎨 UI/UX Design Approach

*   **Typography:** A combination of **Inter** for legibility and **Outfit** for a tech-forward branding feel.
*   **Color Palette:** A primary Indigo hue (`#6366f1`) paired with vibrant pink accents, creating a high-energy learning environment.
*   **Glassmorphism:** Leverages `backdrop-filter: blur()` and subtle gradients to achieve a premium, modern feel.
*   **Dynamic Rendering:** Efficient DOM updates for a lag-free experience even with many categories.

---

## 🛠️ Deployment

The project is designed to be hosted on any static site hosting service (Netlify, Vercel, GitHub Pages).
*   **Device-Based Storage:** Note that progress is currently saved in your browser's local storage. Clearing your cache will reset progress (unless you use the **Export JSON** feature).

---

### 👨‍💻 Developed by [Your Name]
*Built with passion for the learning community.*
