// src/components/Task/TaskItem.tsx
import React, { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../../interfaces/Task';
import { FaPlay, FaPause, FaStop, FaCheck, FaEdit, FaTrashAlt, FaChevronDown, FaChevronUp, FaPlus, FaTimes } from 'react-icons/fa';
import moment from 'moment';

interface TaskItemProps {
  task: Task;
  onStartTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onStopTask: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  getCategoryColor: (categoryName: string | undefined) => string | undefined; // New prop
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onStartTask,
  onPauseTask,
  onStopTask,
  onMarkComplete,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  getCategoryColor // Destructure new prop
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleStatusAction = () => {
    if (task.status === 'pending' || task.status === 'paused') {
      onStartTask(task.id);
    } else if (task.status === 'in-progress') {
      onPauseTask(task.id);
    }
  };

  const statusButtonText = () => {
    switch (task.status) {
      case 'pending':
        return <><FaPlay className="mr-1" /> Start</>;
      case 'in-progress':
        return <><FaPause className="mr-1" /> Pause</>;
      case 'paused':
        return <><FaPlay className="mr-1" /> Resume</>;
      case 'completed':
        return <><FaCheck className="mr-1" /> Completed</>;
      default:
        return 'Action';
    }
  };

  const getPriorityClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Subtask logic
  const completedSubtasksCount = task.subtasks?.filter(sub => sub.completed).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasksCount > 0 ? (completedSubtasksCount / totalSubtasksCount) * 100 : 0;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    }
  };

  // Determine category color for display
  const categoryColor = getCategoryColor(task.category);


  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4 border-l-4 ${task.status === 'completed' ? 'border-green-500' : 'border-blue-500'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-semibold ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{task.description}</p>
          )}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {task.dueDate && (
              <span className="mr-3">
                Due: {moment(task.dueDate).format('MMM DD, YYYY')} {task.dueTime ? `at ${moment(task.dueTime, 'HH:mm').format('hh:mm A')}` : ''}
              </span>
            )}
            {task.category && (
              // Display category as a colored badge
              <span
                className="inline-block px-2 py-1 rounded-full text-xs font-semibold mr-2 text-white"
                style={{ backgroundColor: categoryColor || '#6b7280' }} // Default to gray if color not found
              >
                {task.category}
              </span>
            )}
            <span className={`${getPriorityClass(task.priority)} font-medium capitalize`}>
              {task.priority} Priority
            </span>
          </div>
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(task.status)}`}>
            {task.status.replace('-', ' ')}
          </span>
          {task.timeSpent > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Time Spent: {Math.floor(task.timeSpent / 3600)}h {Math.floor((task.timeSpent % 3600) / 60)}m {Math.floor(task.timeSpent % 60)}s
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
          {task.status !== 'completed' && (
            <>
              <button
                onClick={handleStatusAction}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                {statusButtonText()}
              </button>
              {task.status === 'in-progress' && (
                <button
                  onClick={() => onStopTask(task.id)}
                  className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  <FaStop className="mr-1" /> Stop
                </button>
              )}
              <button
                onClick={() => onMarkComplete(task.id)}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                <FaCheck className="mr-1" /> Complete
              </button>
            </>
          )}
          <button
            onClick={() => onEditTask(task)}
            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <FaEdit className="mr-1" /> Edit
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors text-sm"
          >
            <FaTrashAlt className="mr-1" /> Delete
          </button>
        </div>
      </div>

      {/* Subtasks Section */}
      {totalSubtasksCount > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
          >
            Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
            {isExpanded ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
          </button>

          {isExpanded && (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${subtaskProgress}%` }}
                ></div>
              </div>

              {/* Subtask List */}
              <ul className="space-y-2">
                {task.subtasks?.map(subtask => (
                  <li key={subtask.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                    <label className="flex items-center text-gray-800 dark:text-gray-200 cursor-pointer flex-grow">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => onToggleSubtask(task.id, subtask.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2 dark:bg-gray-900 dark:border-gray-600"
                      />
                      <span className={`${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                        {subtask.title}
                      </span>
                    </label>
                    <button
                      onClick={() => onDeleteSubtask(task.id, subtask.id)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 transition-colors"
                      title="Delete Subtask"
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add New Subtask Input */}
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="Add new subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                  title="Add Subtask"
                >
                  <FaPlus />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;