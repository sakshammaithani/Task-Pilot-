// src/App.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios'; // Make sure axios is imported
import Header from './components/Header';
import TaskForm from './components/Task/TaskForm';
import TaskList from './components/Task/tasklist';
import type { Task, TaskStatus, TaskPriority, Subtask, TimeLog, Category } from './interfaces/Task';
import './index.css';
import { requestNotificationPermission, checkAndNotifyTasks } from './utils/notificationUtils.js';
import ConfirmationModal from './components/ConfirmationModal';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import CategoryManagement from './components/Category/CategoryManagement';
import { v4 as uuidv4 } from 'uuid';

// Import the new AuthProvider and useAuth hook
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Import the new AuthPage (Login/Signup) component
import AuthPage from './components/Auth/AuthPage';
// NEW IMPORT: LandingPage
import LandingPage from './components/LandingPage';

// Define types for sorting options
type SortBy = 'dueDate' | 'priority' | 'title' | 'createdAt' | 'none';
type SortOrder = 'asc' | 'desc';

// Define type for different views
type AppView = 'dashboard' | 'list' | 'calendar' | 'categories';
export type GlobalView = 'home' | 'app' | 'auth'; // Added 'auth' view for login/signup

// Set axios defaults to send cookies (for session management)
axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000'; // Ensure this matches your backend URL

// Helper to generate next recurring task - This logic will eventually move to backend
const generateNextRecurringTask = (originalTask: Task, userId: string): Task | null => {
  if (!originalTask.isRecurring || !originalTask.recurrenceType || !originalTask.recurrenceInterval) {
    return null;
  }

  const now = new Date();
  const originalDueDate = new Date(`${originalTask.dueDate}T${originalTask.dueTime || '00:00'}`);
  let nextDueDate = new Date(originalDueDate);

  while (nextDueDate.getTime() < now.getTime()) {
    switch (originalTask.recurrenceType) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + originalTask.recurrenceInterval);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + (originalTask.recurrenceInterval * 7));
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + originalTask.recurrenceInterval);
        break;
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + originalTask.recurrenceInterval);
        break;
      default:
        return null;
    }
    if (originalTask.recurrenceEndDate) {
      const recurrenceEndDate = new Date(originalTask.recurrenceEndDate);
      if (nextDueDate > recurrenceEndDate) {
        return null;
      }
    }
  }

  const newId = uuidv4();
  const newTimestamp = Date.now();
  const nextDueDateString = nextDueDate.toISOString().split('T')[0];

  return {
    ...originalTask,
    id: newId,
    dueDate: nextDueDateString,
    status: 'pending' as TaskStatus,
    completedDate: undefined,
    notificationSent: false,
    timeSpent: 0,
    trackingStartTime: null,
    timeLogs: [],
    subtasks: originalTask.subtasks?.map(sub => ({ ...sub, completed: false, id: uuidv4() })) || [],
    createdAt: newTimestamp,
    updatedAt: newTimestamp,
    userId: userId, // Ensure new task has userId
  } as Task;
};


function AppContent() {
  const { user, isLoading, logout, isAuthenticated } = useAuth(); // Use useAuth hook

  const [globalView, setGlobalView] = useState<GlobalView>('home'); // Start on the landing page
  const [currentView, setCurrentView] = useState<AppView>('list'); // Default app view

  // State for filters and sorting
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // --- Utility for Local Storage (for one-time migration) ---
  const getLocalStorageKey = (key: string) => `taskpilot_${key}_guest`; // Use 'guest' key for pre-auth data
  const getAuthLocalStorageKey = (key: string) => `taskpilot_${key}_${user?.id}`; // Use user ID for post-auth data

  // --- ALL CALLBACK HOOKS (Now making API calls) ---

  // Category Callbacks
  const handleAddCategory = useCallback(async (name: string, color: string) => {
    if (!isAuthenticated || !user) return;
    try {
      if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        alert('Category with this name already exists!');
        return;
      }
      const newCategory: Category = { id: uuidv4(), name, color, userId: user.id, createdAt: Date.now(), updatedAt: Date.now() };

      const response = await axios.post(`${API_URL}/api/categories`, newCategory);
      setCategories(prev => [...prev, response.data]); // Use data returned from backend
    } catch (error: any) {
      console.error('Error adding category:', error.response?.data || error.message);
      alert(`Failed to add category: ${error.response?.data?.message || error.message}`);
    }
  }, [categories, isAuthenticated, user]);

  const handleEditCategory = useCallback(async (id: string, newName: string, newColor: string) => {
    if (!isAuthenticated || !user) return;
    try {
      if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === newName.toLowerCase())) {
        alert('Category with this name already exists!');
        return;
      }
      const updatedCategoryData = { name: newName, color: newColor };
      const response = await axios.put(`${API_URL}/api/categories/${id}`, updatedCategoryData);
      setCategories(prev => prev.map(cat => (cat.id === id ? response.data : cat)));
    } catch (error: any) {
      console.error('Error editing category:', error.response?.data || error.message);
      alert(`Failed to edit category: ${error.response?.data?.message || error.message}`);
    }
  }, [categories, isAuthenticated, user]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return;
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) return;

    const tasksWithCategory = tasks.filter(task => task.category === categoryToDelete.name);
    if (tasksWithCategory.length > 0 && !window.confirm(`Category "${categoryToDelete.name}" is used by ${tasksWithCategory.length} task(s). Deleting it will remove the category from these tasks. Continue?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));

      // Also update tasks that used this category
      setTasks(currentTasks => {
        const updatedTasks = currentTasks.map(task =>
          task.category === categoryToDelete.name ? { ...task, category: undefined } : task
        );
        // Important: Update these tasks on the backend too if their category field changed
        updatedTasks.forEach(async task => {
          if (task.category === undefined && tasksWithCategory.some(t => t.id === task.id)) {
            await axios.put(`${API_URL}/api/tasks/${task.id}`, { category: undefined });
          }
        });
        return updatedTasks;
      });
    } catch (error: any) {
      console.error('Error deleting category:', error.response?.data || error.message);
      alert(`Failed to delete category: ${error.response?.data?.message || error.message}`);
    }
  }, [categories, tasks, isAuthenticated, user]);


  // Task Callbacks
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!isAuthenticated || !user) return;
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, updates);
      setTasks(prevTasks => prevTasks.map(task => (task.id === id ? response.data : task)));
    } catch (error: any) {
      console.error('Error updating task:', error.response?.data || error.message);
      alert(`Failed to update task: ${error.response?.data?.message || error.message}`);
    }
  }, [isAuthenticated, user]);


  const handleAddTask = useCallback(async (newTask: Task) => {
    if (!isAuthenticated || !user) return;
    try {
      const taskWithId: Task = {
        ...newTask,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: user.id // Ensure userId is set
      };
      const response = await axios.post(`${API_URL}/api/tasks`, taskWithId);
      setTasks(prevTasks => [...prevTasks, response.data]);
      setEditingTask(null);
      setCurrentView('list');
    } catch (error: any) {
      console.error('Error adding task:', error.response?.data || error.message);
      alert(`Failed to add task: ${error.response?.data?.message || error.message}`);
    }
  }, [isAuthenticated, user]);

  const handleEditTask = useCallback(async (updatedTask: Task) => {
    if (!isAuthenticated || !user) return;
    try {
      const originalTask = tasks.find(t => t.id === updatedTask.id);
      if (!originalTask) return;

      const dueDateChanged = originalTask.dueDate !== updatedTask.dueDate;
      const dueTimeChanged = originalTask.dueTime !== updatedTask.dueTime;
      const notificationPrefChanged = originalTask.notificationPreference !== updatedTask.notificationPreference;
      const customDateChanged = originalTask.customNotificationDate !== updatedTask.customNotificationDate;
      const customTimeChanged = originalTask.customNotificationTime !== updatedTask.customNotificationTime;

      const resetNotificationSent = dueDateChanged || dueTimeChanged || notificationPrefChanged || customDateChanged || customTimeChanged;

      const taskToUpdate: Partial<Task> = { // Send only updated fields
        ...updatedTask,
        notificationSent: resetNotificationSent ? false : (updatedTask.notificationSent || false),
        updatedAt: Date.now(),
      };

      // Ensure userId isn't sent in PUT unless specifically required, it's inferred from session
      delete (taskToUpdate as any).userId;

      const response = await axios.put(`${API_URL}/api/tasks/${updatedTask.id}`, taskToUpdate);
      setTasks(prevTasks => prevTasks.map(task => (task.id === updatedTask.id ? response.data : task)));
      setEditingTask(null);
      setCurrentView('list');
    } catch (error: any) {
      console.error('Error editing task:', error.response?.data || error.message);
      alert(`Failed to edit task: ${error.response?.data?.message || error.message}`);
    }
  }, [tasks, isAuthenticated, user]);


  const handleAddTaskForDay = useCallback((date: string) => {
    if (!isAuthenticated || !user) {
      setGlobalView('auth'); // Redirect to auth if not logged in
      return;
    }
    const now = Date.now();
    setEditingTask({
      id: uuidv4(),
      title: '',
      description: '',
      dueDate: date,
      dueTime: '',
      priority: 'medium',
      status: 'pending',
      category: undefined,
      notificationPreference: 'none',
      customNotificationDate: undefined,
      customNotificationTime: undefined,
      timeSpent: 0,
      trackingStartTime: null,
      notificationSent: false,
      createdAt: now,
      updatedAt: now,
      subtasks: [],
      isRecurring: false,
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceEndDate: null,
      timeLogs: [],
      userId: user.id // Add userId
    } as Task);
    setCurrentView('list');
  }, [isAuthenticated, user]);


  const handleMarkComplete = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return;
    const taskToComplete = tasks.find(task => task.id === id);
    if (!taskToComplete) return;

    let finalTimeSpent = taskToComplete.timeSpent;
    let updatedTimeLogs: TimeLog[] = taskToComplete.timeLogs || [];

    if (taskToComplete.status === 'in-progress' && taskToComplete.trackingStartTime !== null) {
      const currentTime = Date.now();
      const sessionDuration = (currentTime - taskToComplete.trackingStartTime) / 1000;
      finalTimeSpent += sessionDuration;
      updatedTimeLogs = taskToComplete.timeLogs ? taskToComplete.timeLogs.map(log =>
        log.endTime === null ? { ...log, endTime: currentTime } : log
      ) : [];
    }

    try {
      await updateTask(id, {
        status: 'completed',
        completedDate: new Date().toLocaleDateString('en-CA'),
        notificationSent: false,
        timeSpent: finalTimeSpent,
        trackingStartTime: null,
        timeLogs: updatedTimeLogs,
      });

      if (taskToComplete.isRecurring) {
        const nextTask = generateNextRecurringTask(taskToComplete, user.id); // Pass userId
        if (nextTask) {
          await handleAddTask(nextTask); // Add recurring task via API
        }
      }
    } catch (error) {
      console.error('Error marking task complete:', error);
      alert('Failed to mark task complete.');
    }
  }, [tasks, updateTask, handleAddTask, isAuthenticated, user]);

  const handleDeleteTask = useCallback((id: string) => {
    if (!isAuthenticated) return;
    setTaskToDeleteId(id);
    setIsConfirmModalOpen(true);
  }, [isAuthenticated]);

  const handleConfirmDelete = useCallback(async () => {
    if (!isAuthenticated || !taskToDeleteId || !user) return;
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskToDeleteId}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDeleteId));
    } catch (error: any) {
      console.error('Error deleting task:', error.response?.data || error.message);
      alert(`Failed to delete task: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsConfirmModalOpen(false);
      setTaskToDeleteId(null);
    }
  }, [taskToDeleteId, isAuthenticated, user]);

  const handleCancelDelete = useCallback(() => {
    setIsConfirmModalOpen(false);
    setTaskToDeleteId(null);
  }, []);

  const handleToggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    if (!isAuthenticated || !user) return;
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedSubtasks = taskToUpdate.subtasks?.map(sub =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    await updateTask(taskId, { subtasks: updatedSubtasks });
  }, [tasks, updateTask, isAuthenticated, user]);

  const handleAddSubtask = useCallback(async (taskId: string, subtaskTitle: string) => {
    if (!isAuthenticated || !user) return;
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const newSubtask: Subtask = {
      id: uuidv4(),
      title: subtaskTitle,
      completed: false,
    };
    await updateTask(taskId, { subtasks: [...(taskToUpdate.subtasks || []), newSubtask] });
  }, [tasks, updateTask, isAuthenticated, user]);

  const handleDeleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    if (!isAuthenticated || !user) return;
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedSubtasks = (taskToUpdate.subtasks || []).filter(sub => sub.id !== subtaskId);
    await updateTask(taskId, { subtasks: updatedSubtasks });
  }, [tasks, updateTask, isAuthenticated, user]);


  // --- ALL EFFECT HOOKS ---
  // Load tasks and categories when user changes or initially authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) { // Only attempt to load if user is null (not authenticated)
        setTasks([]);
        setCategories([]);
        return;
      }

      try {
        // --- Fetch tasks from backend ---
        const tasksResponse = await axios.get(`${API_URL}/api/tasks`);
        let fetchedTasks: Task[] = tasksResponse.data;

        // --- Fetch categories from backend ---
        const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
        let fetchedCategories: Category[] = categoriesResponse.data;

        // --- ONE-TIME DATA MIGRATION FROM LOCAL STORAGE ---
        // This checks if the user has data in local storage from *before* authentication
        // and if they don't have any data on the backend yet.
        const hasLocalTasks = localStorage.getItem(getLocalStorageKey('tasks'));
        const hasLocalCategories = localStorage.getItem(getLocalStorageKey('categories'));
        const hasBackendTasks = fetchedTasks.length > 0;
        const hasBackendCategories = fetchedCategories.length > 0;

        if (!hasBackendTasks && hasLocalTasks) {
          console.log('Migrating local tasks to backend...');
          const localTasks: Task[] = JSON.parse(hasLocalTasks).map((task: Task) => ({
            ...task,
            userId: user.id, // Assign current user's ID
            id: task.id || uuidv4(), // Ensure ID for old tasks
            createdAt: task.createdAt || Date.now(),
            updatedAt: task.updatedAt || Date.now(),
          }));
          for (const task of localTasks) {
            try {
              await axios.post(`${API_URL}/api/tasks`, task);
            } catch (postError) {
              console.warn(`Failed to migrate task ${task.id}:`, postError);
            }
          }
          fetchedTasks = [...fetchedTasks, ...localTasks]; // Add migrated tasks to current set
          localStorage.removeItem(getLocalStorageKey('tasks')); // Clear old local storage
        }

        if (!hasBackendCategories && hasLocalCategories) {
          console.log('Migrating local categories to backend...');
          const localCategories: Category[] = JSON.parse(hasLocalCategories).map((cat: Category) => ({
            ...cat,
            userId: user.id, // Assign current user's ID
            id: cat.id || uuidv4(), // Ensure ID for old categories
            createdAt: cat.createdAt || Date.now(),
            updatedAt: cat.updatedAt || Date.now(),
          }));
          for (const category of localCategories) {
            try {
              await axios.post(`${API_URL}/api/categories`, category);
            } catch (postError) {
              console.warn(`Failed to migrate category ${category.id}:`, postError);
            }
          }
          fetchedCategories = [...fetchedCategories, ...localCategories]; // Add migrated categories
          localStorage.removeItem(getLocalStorageKey('categories')); // Clear old local storage
        }
        // --- END MIGRATION LOGIC ---

        setTasks(fetchedTasks.map((task: Task) => ({
          ...task, // Spread existing task properties first
          // These are now for ensuring data consistency from backend, though backend should return correct types
          recurrenceType: task.recurrenceType || 'none',
          recurrenceInterval: task.recurrenceInterval || 1,
          recurrenceEndDate: task.recurrenceEndDate || null,
          subtasks: task.subtasks || [],
          timeLogs: task.timeLogs || [],
          category: task.category || undefined,
          customNotificationDate: task.customNotificationDate || undefined,
          customNotificationTime: task.customNotificationTime || undefined,
          userId: task.userId, // userId should now always come from backend
        }) as Task));

        setCategories(fetchedCategories);

      } catch (error: any) {
        console.error('Error loading data from backend:', error.response?.data || error.message);
        alert('Failed to load data from server. Please try logging out and in again.');
        setTasks([]);
        setCategories([]);
      }
    };

    if (isAuthenticated) {
      loadUserData();
    } else {
      // If not authenticated, clear tasks/categories (or load from anonymous local storage if you had it)
      // For now, we clear them when unauthenticated
      setTasks([]);
      setCategories([]);
    }
  }, [isAuthenticated, user]);


  useEffect(() => {
    let notificationInterval: number | undefined;
    if (isAuthenticated && tasks.length > 0 && Notification.permission === 'granted') {
      notificationInterval = window.setInterval(() => {
        checkAndNotifyTasks(tasks, updateTask);
      }, 15000);
    }

    return () => {
      if (notificationInterval !== undefined) {
        clearInterval(notificationInterval);
      }
    };
  }, [isAuthenticated, tasks, updateTask]);

  // --- ALL MEMO HOOKS ---
  const sortedAndFilteredTasks = useMemo(() => {
    let currentTasks = tasks;

    if (searchTerm.trim() !== '') {
      const lowerCaseQuery = searchTerm.toLowerCase();
      currentTasks = currentTasks.filter(
        task =>
          task.title.toLowerCase().includes(lowerCaseQuery) ||
          task.description?.toLowerCase().includes(lowerCaseQuery) ||
          task.category?.toLowerCase().includes(lowerCaseQuery) ||
          task.subtasks?.some(sub => sub.title.toLowerCase().includes(lowerCaseQuery))
      );
    }

    if (filterStatus !== 'all') {
      currentTasks = currentTasks.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      currentTasks = currentTasks.filter(task => task.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      currentTasks = currentTasks.filter(task => task.category === filterCategory);
    }

    if (sortBy !== 'none') {
      currentTasks = [...currentTasks].sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'dueDate') {
          const dateA = new Date(`${a.dueDate}T${a.dueTime || '00:00'}`);
          const dateB = new Date(`${b.dueDate}T${b.dueTime || '00:00'}`);
          comparison = dateA.getTime() - dateB.getTime();
        } else if (sortBy === 'priority') {
          const priorityOrder: Record<TaskPriority, number> = { 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'createdAt') {
          comparison = a.createdAt - b.createdAt;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return currentTasks;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, sortBy, sortOrder]);


  const getCategoryColor = useCallback((categoryName: string | undefined): string | undefined => {
    if (!categoryName) return undefined;
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : undefined;
  }, [categories]);

  // Add missing handlers for task time tracking
  const handleStartTask = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.status === 'completed') return; // Don't start completed tasks
    const currentTime = Date.now();
    // Add a new time log entry
    const newTimeLog: TimeLog = {
      startTime: currentTime,
      endTime: null,
    };
    await updateTask(id, {
      status: 'in-progress',
      trackingStartTime: currentTime,
      timeLogs: [...(task.timeLogs || []), newTimeLog],
    });
  }, [tasks, updateTask, isAuthenticated, user]);

  const handlePauseTask = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task || task.status !== 'in-progress' || task.trackingStartTime === null) return;
    const currentTime = Date.now();
    const sessionDuration = (currentTime - task.trackingStartTime) / 1000;
    const updatedTimeSpent = (task.timeSpent || 0) + sessionDuration;
    // Update the last time log's endTime
    const updatedTimeLogs = (task.timeLogs || []).map((log, idx, arr) =>
      idx === arr.length - 1 && log.endTime === null
        ? { ...log, endTime: currentTime }
        : log
    );
    await updateTask(id, {
      status: 'paused',
      trackingStartTime: null,
      timeSpent: updatedTimeSpent,
      timeLogs: updatedTimeLogs,
    });
  }, [tasks, updateTask, isAuthenticated, user]);

  const handleStopTask = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task || (task.status !== 'in-progress' && task.status !== 'paused')) return;
    let updatedTimeSpent = task.timeSpent || 0;
    let updatedTimeLogs = task.timeLogs || [];
    if (task.status === 'in-progress' && task.trackingStartTime !== null) {
      const currentTime = Date.now();
      const sessionDuration = (currentTime - task.trackingStartTime) / 1000;
      updatedTimeSpent += sessionDuration;
      updatedTimeLogs = updatedTimeLogs.map((log, idx, arr) =>
        idx === arr.length - 1 && log.endTime === null
          ? { ...log, endTime: currentTime }
          : log
      );
    }
    await updateTask(id, {
      status: 'pending',
      trackingStartTime: null,
      timeSpent: updatedTimeSpent,
      timeLogs: updatedTimeLogs,
    });
  }, [tasks, updateTask, isAuthenticated, user]);


  // Handler for navigation from Header or LandingPage
  const handleGlobalNavigate = useCallback((view: GlobalView) => {
    // If trying to go to 'app' but not authenticated, redirect to auth page
    if (view === 'app' && !isAuthenticated) {
      setGlobalView('auth');
    } else {
      setGlobalView(view);
    }
  }, [isAuthenticated]);


  // --- CONDITIONAL RENDERING FOR THE UI ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background dark:bg-dark-background">
        <p className="text-xl text-primary dark:text-dark-primary">Loading application...</p>
      </div>
    );
  }

  // Render different views based on globalView and authentication status
  return (
    <div className="min-h-screen font-sans">
      <Header
        onNavigate={handleGlobalNavigate}
        isLandingPage={globalView === 'home'}
      />

      {globalView === 'home' && (
        <LandingPage onGetStarted={() => handleGlobalNavigate('app')} />
      )}

      {globalView === 'auth' && (
        <AuthPage /> // Show login/signup form
      )}

      {globalView === 'app' && isAuthenticated && (
        <div className="pt-20 container mx-auto py-8 px-4"> {/* pt-20 to account for fixed header */}

          {/* View Switching Buttons */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {['dashboard', 'list', 'calendar', 'categories'].map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view as AppView)}
                className={`px-5 py-2 rounded-full text-base font-medium transition-colors duration-200 shadow-md
                  ${currentView === view
                    ? 'bg-accent text-white dark:bg-dark-accent'
                    : 'bg-surface text-primary hover:bg-gray-100 dark:bg-dark-surface dark:text-dark-primary dark:hover:bg-dark-divider'
                  }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Conditionally Render Views */}
          {currentView === 'dashboard' && (
            <Dashboard tasks={tasks} />
          )}

          {currentView === 'list' && (
            <>
              {editingTask ? (
                <>
                  <h2 className="text-2xl font-semibold mb-4 text-primary dark:text-dark-primary">Edit Task</h2>
                  <TaskForm
                    initialTask={editingTask}
                    onSaveTask={handleEditTask}
                    onCancel={() => setEditingTask(null)}
                    availableCategories={categories}
                    onAddCategory={handleAddCategory}
                  />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold mt-4 mb-4 text-primary dark:text-dark-primary">Add New Task</h2>
                  <TaskForm
                      onAddTask={handleAddTask}
                      availableCategories={categories}
                      onAddCategory={handleAddCategory}
                  />
                </>
              )}

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-dark-primary">Your Tasks</h2>

              {/* Filter, Sort, and Search Controls */}
              <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap p-4 bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-border dark:border-dark-border">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow md:w-auto p-3 border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-card dark:text-dark-primary"
                />

                {/* Filter Buttons (Status) */}
                <div className="flex space-x-2 flex-wrap justify-center md:justify-start">
                  {['all', 'pending', 'in-progress', 'paused', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as TaskStatus | 'all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                        ${filterStatus === status
                          ? 'bg-accent text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-border dark:text-dark-primary dark:hover:bg-dark-divider'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {/* Filter Dropdown (Priority) */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="filterPriority" className="text-sm font-medium text-primary dark:text-dark-primary">Priority:</label>
                  <select
                    id="filterPriority"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                    className="px-3 py-2 rounded-md border border-border dark:border-dark-border dark:bg-dark-card dark:text-dark-primary focus:outline-none focus:ring-accent focus:border-accent text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Category Filter Dropdown */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="filterCategory" className="text-sm font-medium text-primary dark:text-dark-primary">Category:</label>
                  <select
                    id="filterCategory"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 rounded-md border border-border dark:border-dark-border dark:bg-dark-card dark:text-dark-primary focus:outline-none focus:ring-accent focus:border-accent text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="sortBy" className="text-sm font-medium text-primary dark:text-dark-primary">Sort by:</label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="px-3 py-2 rounded-md border border-border dark:border-dark-border dark:bg-dark-card dark:text-dark-primary focus:outline-none focus:ring-accent focus:border-accent text-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="createdAt">Created Date</option>
                  </select>

                  {sortBy !== 'none' && (
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-border dark:text-dark-primary dark:hover:bg-dark-divider text-sm"
                      title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  )}
                </div>
              </div>

              <TaskList
                tasks={sortedAndFilteredTasks}
                onStartTask={handleStartTask}
                onPauseTask={handlePauseTask}
                onStopTask={handleStopTask}
                onMarkComplete={handleMarkComplete}
                onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {setEditingTask(task);}}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                getCategoryColor={getCategoryColor}
              />
            </>
          )}

          {currentView === 'calendar' && (
            <CalendarView tasks={tasks} onAddTaskForDay={handleAddTaskForDay} />
          )}

          {currentView === 'categories' && (
            <CategoryManagement
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onClose={() => setCurrentView('list')}
            />
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      {globalView === 'app' && isAuthenticated && (
        <div className="fixed bottom-5 right-5 z-40">
            <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
            >
                Logout
            </button>
        </div>
      )}
    </div>
  );
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;