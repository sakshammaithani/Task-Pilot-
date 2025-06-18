// src/components/Task/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, Subtask, RecurrenceType, NotificationPreference, Category } from '../../interfaces/Task';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  onAddTask?: (task: Task) => void;
  onSaveTask?: (task: Task) => void;
  onCancel?: () => void;
  initialTask?: Task | null;
  availableCategories: Category[]; // NEW: Prop for available categories
  onAddCategory: (name: string, color: string) => void; // NEW: Prop to add a new category
}

const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  onSaveTask,
  onCancel,
  initialTask,
  availableCategories, // Destructure new prop
  onAddCategory, // Destructure new prop
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [dueTime, setDueTime] = useState(initialTask?.dueTime || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'pending');
  const [isRecurring, setIsRecurring] = useState(initialTask?.isRecurring || false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialTask?.recurrenceType || 'none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialTask?.recurrenceInterval || 1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialTask?.recurrenceEndDate || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference>(initialTask?.notificationPreference || 'none');
  const [customNotificationDate, setCustomNotificationDate] = useState(initialTask?.customNotificationDate || '');
  const [customNotificationTime, setCustomNotificationTime] = useState(initialTask?.customNotificationTime || '');
  // NEW: State for selected category and new category input
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialTask?.category);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#007bff'); // Default color

  useEffect(() => {
    // This useEffect ensures the form resets or populates when initialTask changes
    // (e.g., when clicking 'Edit' on a different task)
    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
    setDueDate(initialTask?.dueDate || '');
    setDueTime(initialTask?.dueTime || '');
    setPriority(initialTask?.priority || 'medium');
    setStatus(initialTask?.status || 'pending');
    setIsRecurring(initialTask?.isRecurring || false);
    setRecurrenceType(initialTask?.recurrenceType || 'none');
    setRecurrenceInterval(initialTask?.recurrenceInterval || 1);
    setRecurrenceEndDate(initialTask?.recurrenceEndDate || '');
    setSubtasks(initialTask?.subtasks || []);
    setNotificationPreference(initialTask?.notificationPreference || 'none');
    setCustomNotificationDate(initialTask?.customNotificationDate || '');
    setCustomNotificationTime(initialTask?.customNotificationTime || '');
    setSelectedCategory(initialTask?.category); // Update selected category
    setShowNewCategoryInput(false); // Hide new category input on task change
    setNewCategoryName(''); // Clear new category name
  }, [initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !dueDate.trim()) {
      alert('Task title and due date are required.');
      return;
    }

    if (isRecurring && (recurrenceType === 'none' || recurrenceInterval <= 0)) {
        alert('Please specify recurrence type and a positive interval for recurring tasks.');
        return;
    }

    if (notificationPreference === 'customTime' && (!customNotificationDate || !customNotificationTime)) {
        alert('Please specify both custom notification date and time.');
        return;
    }

    // Handle adding a new category if the option was selected and input provided
    let finalCategory = selectedCategory;
    if (showNewCategoryInput && newCategoryName.trim()) {
        const categoryExists = availableCategories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase());
        if (categoryExists) {
            alert('A category with this name already exists. Please select it or choose a different name.');
            return;
        }
        onAddCategory(newCategoryName.trim(), newCategoryColor);
        finalCategory = newCategoryName.trim(); // Use the newly added category
        setShowNewCategoryInput(false); // Hide input after adding
        setNewCategoryName(''); // Clear input
        setNewCategoryColor('#007bff'); // Reset color
    }


    const taskData: Task = {
      id: initialTask?.id || uuidv4(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: dueTime || undefined, // Store as undefined if empty
      priority,
      status,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : 'none',
      recurrenceInterval: isRecurring ? recurrenceInterval : 1,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      subtasks: subtasks.length > 0 ? subtasks : undefined, // Store as undefined if empty
      notificationPreference,
      customNotificationDate: notificationPreference === 'customTime' ? customNotificationDate : undefined,
      customNotificationTime: notificationPreference === 'customTime' ? customNotificationTime : undefined,
      timeSpent: initialTask?.timeSpent || 0,
      trackingStartTime: initialTask?.trackingStartTime || null,
      notificationSent: initialTask?.notificationSent || false,
      createdAt: initialTask?.createdAt || Date.now(),
      updatedAt: Date.now(),
      timeLogs: initialTask?.timeLogs || [],
      completedDate: initialTask?.completedDate || undefined,
      category: finalCategory, // Use the selected/newly added category
    };

    if (initialTask) {
      onSaveTask?.(taskData);
    } else {
      onAddTask?.(taskData);
    }
    // Clear form after submission if adding a new task
    if (!initialTask) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setDueTime('');
        setPriority('medium');
        setStatus('pending');
        setIsRecurring(false);
        setRecurrenceType('none');
        setRecurrenceInterval(1);
        setRecurrenceEndDate('');
        setSubtasks([]);
        setNewSubtaskTitle('');
        setNotificationPreference('none');
        setCustomNotificationDate('');
        setCustomNotificationTime('');
        setSelectedCategory(undefined); // Clear selected category
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { id: uuidv4(), title: newSubtaskTitle.trim(), completed: false }]);
      setNewSubtaskTitle('');
    }
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(sub =>
      sub.id === id ? { ...sub, completed: !sub.completed } : sub
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            required
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            required
          />
        </div>

        {/* Due Time */}
        <div>
          <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Time (Optional)
          </label>
          <input
            type="time"
            id="dueTime"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Status (only editable in edit mode) */}
        {initialTask && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <div className="flex items-center gap-2">
            <select
              id="category"
              value={selectedCategory || ''} // Use empty string for undefined to ensure controlled component
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'add-new') {
                  setShowNewCategoryInput(true);
                  setSelectedCategory(undefined); // Clear selection if adding new
                } else {
                  setShowNewCategoryInput(false);
                  setSelectedCategory(value || undefined); // Set category or undefined if empty
                }
              }}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">No Category</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="add-new">-- Add New Category --</option>
            </select>
          </div>
        </div>

        {/* New Category Input (conditionally rendered) */}
        {showNewCategoryInput && (
          <div className="col-span-1 md:col-span-2 flex gap-2 items-center">
            <input
              type="text"
              placeholder="New Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="mt-1 w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              title="Select category color"
            />
          </div>
        )}

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-y"
          ></textarea>
        </div>
      </div>

      {/* --- Notification Preference --- */}
      <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Notification Preference</label>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              name="notificationPreference"
              value="none"
              checked={notificationPreference === 'none'}
              onChange={() => setNotificationPreference('none')}
              className="mr-2"
            />
            None
          </label>
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              name="notificationPreference"
              value="dueDate"
              checked={notificationPreference === 'dueDate'}
              onChange={() => setNotificationPreference('dueDate')}
              className="mr-2"
            />
            On Due Date/Time
          </label>
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              name="notificationPreference"
              value="customTime"
              checked={notificationPreference === 'customTime'}
              onChange={() => setNotificationPreference('customTime')}
              className="mr-2"
            />
            Custom Time
          </label>
        </div>

        {notificationPreference === 'customTime' && (
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="customNotificationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Notification Date
              </label>
              <input
                type="date"
                id="customNotificationDate"
                value={customNotificationDate}
                onChange={(e) => setCustomNotificationDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label htmlFor="customNotificationTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Notification Time
              </label>
              <input
                type="time"
                id="customNotificationTime"
                value={customNotificationTime}
                onChange={(e) => setCustomNotificationTime(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* --- Recurring Task Section --- */}
      <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <label className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="mr-2"
          />
          Recurring Task
        </label>

        {isRecurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurrence Type
              </label>
              <select
                id="recurrenceType"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Repeat Every (Interval)
              </label>
              <input
                type="number"
                id="recurrenceInterval"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurrence End Date (Optional)
              </label>
              <input
                type="date"
                id="recurrenceEndDate"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* --- Subtasks Section --- */}
      <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Subtasks</h3>
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Add a new subtask"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                handleAddSubtask();
              }
            }}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Add
          </button>
        </div>
        {subtasks.length > 0 && (
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {subtasks.map(sub => (
              <li key={sub.id} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => handleToggleSubtask(sub.id)}
                    className="mr-2"
                  />
                  <span className={`${sub.completed ? 'line-through text-gray-500' : ''}`}>
                    {sub.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(sub.id)}
                  className="ml-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Delete subtask"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {initialTask ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;