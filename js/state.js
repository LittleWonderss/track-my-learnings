/**
 * State Management & Data Transformation
 */

const STORAGE_KEY = 'mathquest_state';

// Initial state template
const initialState = {
  categories: [],
  revisionTopics: [],
  settings: {
    theme: 'light',
    streak: 0,
    lastPlayed: null,
  }
};

let state = JSON.parse(JSON.stringify(initialState));

/**
 * Load state from localStorage with migration support
 */
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    initOrMigrate();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    
    // Migration check: If it's the old structure (no 'categories' key)
    if (!parsed.categories) {
      // Only migrate if there's actually something to migrate
      const hasData = (parsed.progress && Object.keys(parsed.progress).length > 0) || 
                      (parsed.custom && parsed.custom.length > 0) ||
                      (parsed.notes && Object.keys(parsed.notes).length > 0);
      
      if (hasData) {
        console.log("Old data structure detected. Migrating...");
        migrateOldToNew(parsed);
      } else {
        initOrMigrate();
      }
    } else {
      // Use Object.assign to keep the same object reference
      Object.assign(state, parsed);
    }
  } catch (e) {
    console.error("Error loading state:", e);
    initOrMigrate();
  }
}

/**
 * Save state to localStorage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Migration Logic: Transforms old fixed structure to new dynamic structure
 */
function migrateOldToNew(oldState) {
  // Use the original hardcoded list to reconstruct the categories
  const topicsListRaw = [
    { section: "Prerequisites" },
    "Natural Numbers", "Whole Numbers", "Integers", "Fractions", "Decimals", "Ratios & Proportions", "Percentages", "Basic Arithmetic", "Order of Operations", "Factors & Multiples", "Prime Numbers", "Exponents", "Roots", "Logarithms", "Basic Geometry", "Coordinate System", "Basic Graph Reading", "Simple Equations", "Inequalities", "Functions (Basic)",
    { section: "Algebra" },
    "Algebraic Expressions", "Linear Equations (1 var)", "Linear Equations (2 var)", "Systems of Equations", "Polynomials", "Factoring Polynomials", "Quadratic Equations", "Functions", "Domain & Range", "Function Transformations", "Inverse Functions", "Exponential Functions", "Logarithmic Functions",
    { section: "Trigonometry" },
    "Angles", "Radians", "Trig Ratios", "Unit Circle", "Trig Identities", "Trig Graphs", "Inverse Trig",
    { section: "Pre-Calculus" },
    "Limits Intuition", "Sequences", "Series", "Sigma Notation",
    { section: "Calculus" },
    "Limits", "Continuity", "Derivatives", "Differentiation Rules", "Chain Rule", "Partial Derivatives", "Gradients", "Second Derivatives", "Optimization", "Gradient Descent", "Integrals", "Definite Integrals", "Multivariable Calculus",
    { section: "Linear Algebra" },
    "Scalars", "Vectors", "Matrices", "Vector Operations", "Dot Product", "Cross Product", "Matrix Operations", "Transpose", "Identity Matrix", "Inverse Matrix", "Determinants", "Rank", "Linear Independence", "Basis", "Eigenvalues", "Eigenvectors", "Diagonalization", "SVD",
    { section: "Probability" },
    "Random Experiments", "Sample Space", "Events", "Probability Basics", "Conditional Probability", "Independence", "Bayes Theorem", "Random Variables", "Discrete Distributions", "Continuous Distributions", "PMF", "PDF", "CDF", "Expected Value", "Variance", "Standard Deviation", "Normal Distribution", "Binomial Distribution", "Poisson Distribution",
    { section: "Statistics" },
    "Descriptive Statistics", "Mean Median Mode", "Variance Stats", "Skewness", "Kurtosis", "Sampling", "Central Limit Theorem", "Confidence Intervals", "Hypothesis Testing", "p-value", "t-test", "Chi-square", "ANOVA", "Correlation", "Covariance", "Regression", "Multiple Regression", "Bias-Variance",
    { section: "Advanced Topics" },
    "Optimization Theory", "Convex Functions", "Lagrange Multipliers", "Information Theory", "Entropy", "KL Divergence", "Markov Chains", "Monte Carlo", "Time Series", "Fourier Transform", "PCA", "Manifold Learning"
  ];

  const categories = [];
  let currentCategory = null;

  topicsListRaw.forEach((item, index) => {
    if (typeof item === 'object' && item.section) {
      currentCategory = {
        id: 'cat_' + Date.now() + '_' + index,
        name: item.section,
        topics: []
      };
      categories.push(currentCategory);
    } else if (currentCategory) {
      const topicId = 'top_' + index;
      const isCompleted = oldState.progress && oldState.progress[index];
      const noteData = (oldState.notes && oldState.notes[index]) || {};
      
      currentCategory.topics.push({
        id: topicId,
        title: item,
        completed: !!isCompleted,
        completedDate: noteData.completedDate || (isCompleted ? oldState.lastPlayed : null),
        notes: noteData.text || "",
        deadline: noteData.date || "",
        subtopics: []
      });
    }
  });

  // Handle custom topics if they exist
  if (oldState.custom && oldState.custom.length > 0) {
    const customCat = {
      id: 'cat_custom',
      name: 'Custom Topics',
      topics: oldState.custom.map((c, i) => ({
        id: 'top_custom_' + i,
        title: c.text,
        completed: c.completed,
        completedDate: c.completed ? oldState.lastPlayed : null,
        notes: "",
        deadline: "",
        subtopics: []
      }))
    };
    categories.push(customCat);
  }

  // Use Object.assign to update the global state object
  Object.assign(state, {
    categories: categories,
    settings: {
      theme: oldState.theme || 'light',
      streak: oldState.streak || 0,
      lastPlayed: oldState.lastPlayed || null,
    }
  });

  saveState();
}

function initOrMigrate() {
  // Reset state to initial structure
  Object.assign(state, JSON.parse(JSON.stringify(initialState)));
  saveState();
}

/**
 * Data Modification Helpers
 */

function addCategory(name) {
  const newCat = {
    id: 'cat_' + Date.now(),
    name: name,
    topics: []
  };
  state.categories.push(newCat);
  saveState();
  return newCat;
}

function deleteCategory(catId) {
  state.categories = state.categories.filter(c => c.id !== catId);
  saveState();
}

function addTopic(catId, title) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const newTopic = {
      id: 'top_' + Date.now(),
      title: title,
      completed: false,
      completedDate: null,
      notes: "",
      deadline: "",
      subtopics: []
    };
    category.topics.push(newTopic);
    saveState();
    return newTopic;
  }
}

function deleteTopic(catId, topicId) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    category.topics = category.topics.filter(t => t.id !== topicId);
    saveState();
  }
}

function addSubtopic(catId, topicId, title) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      const newSub = {
        id: 'sub_' + Date.now(),
        title: title,
        completed: false,
        completedDate: null
      };
      topic.subtopics.push(newSub);
      saveState();
      return newSub;
    }
  }
}

function deleteSubtopic(catId, topicId, subId) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      topic.subtopics = topic.subtopics.filter(s => s.id !== subId);
      saveState();
    }
  }
}

function toggleTopic(catId, topicId) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      topic.completed = !topic.completed;
      topic.completedDate = topic.completed ? new Date().toISOString().split('T')[0] : null;
      
      // Update lastPlayed for streak tracking
      if (topic.completed) {
        state.settings.lastPlayed = new Date().toISOString();
      }
      
      saveState();
      updateStreak();
    }
  }
}

function toggleSubtopic(catId, topicId, subId) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      const sub = topic.subtopics.find(s => s.id === subId);
      if (sub) {
        sub.completed = !sub.completed;
        sub.completedDate = sub.completed ? new Date().toISOString().split('T')[0] : null;

        if (sub.completed) {
            state.settings.lastPlayed = new Date().toISOString();
        }

        saveState();
        updateStreak();
      }
    }
  }
}

function updateTopicDetails(catId, topicId, notes, deadline) {
  const category = state.categories.find(c => c.id === catId);
  if (category) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) {
      topic.notes = notes;
      topic.deadline = deadline;
      saveState();
    }
  }
}

/**
 * Streak Calculation
 */
function updateStreak() {
  const completionDates = getAllCompletionDates();
  if (completionDates.length === 0) {
    state.settings.streak = 0;
    saveState();
    return;
  }

  const uniqueDates = [...new Set(completionDates)].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    state.settings.streak = 0;
  } else {
    let currentStreak = 0;
    let cursor = new Date(uniqueDates[0]);
    
    // Simple streak check: how many consecutive days back from the latest activity
    while (uniqueDates.includes(cursor.toISOString().split('T')[0])) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    state.settings.streak = currentStreak;
  }
  
  saveState();
}

function getAllCompletionDates() {
  const dates = [];
  state.categories.forEach(cat => {
    cat.topics.forEach(top => {
      if (top.completed && top.completedDate) dates.push(top.completedDate);
      top.subtopics.forEach(sub => {
        if (sub.completed && sub.completedDate) dates.push(sub.completedDate);
      });
    });
  });
  return dates;
}

function calculateProgress() {
  let total = 0;
  let completed = 0;
  
  state.categories.forEach(cat => {
    cat.topics.forEach(top => {
      total++;
      if (top.completed) completed++;
      top.subtopics.forEach(sub => {
        total++;
        if (sub.completed) completed++;
      });
    });
  });
  
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    left: total - completed
  };
}

/**
 * REVISION UTILITIES
 */
function addRevisionTopic(title) {
  const newTopic = {
    id: 'rev_' + Date.now(),
    title: title,
    createdDate: new Date().toISOString().split('T')[0],
    completedSessions: {} // { intervalIndex: boolean }
  };
  state.revisionTopics.push(newTopic);
  saveState();
  return newTopic;
}

function deleteRevisionTopic(id) {
  state.revisionTopics = state.revisionTopics.filter(t => t.id !== id);
  saveState();
}

function toggleRevisionSession(topicId, sessionIndex) {
  const topic = state.revisionTopics.find(t => t.id === topicId);
  if (topic) {
    if (!topic.completedSessions) topic.completedSessions = {};
    topic.completedSessions[sessionIndex] = !topic.completedSessions[sessionIndex];
    saveState();
  }
}

const REVISION_INTERVALS = [1, 2, 3, 7, 14, 21, 28, 60, 90, 120];

function generateRevisionDates(createdDateStr) {
  const base = new Date(createdDateStr);
  return REVISION_INTERVALS.map(days => {
    const d = new Date(base);
    d.setDate(base.getDate() + days);
    return d.toISOString().split('T')[0];
  });
}

// Export for use in other files
window.AppStore = {
  state,
  loadState,
  saveState,
  addCategory,
  deleteCategory,
  addTopic,
  deleteTopic,
  addSubtopic,
  deleteSubtopic,
  toggleTopic,
  toggleSubtopic,
  updateTopicDetails,
  calculateProgress,
  getAllCompletionDates,
  addRevisionTopic,
  deleteRevisionTopic,
  generateRevisionDates,
  toggleRevisionSession
};
