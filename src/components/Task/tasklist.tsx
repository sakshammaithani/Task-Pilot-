// src/components/Task/TaskList.tsx
import React from 'react';
import type { Task, TaskStatus, Subtask } from '../../interfaces/Task';

interface TaskListProps {
  tasks: Task[];
  onStartTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onStopTask: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  getCategoryColor: (categoryName: string | undefined) => string | undefined;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onStartTask,
  onPauseTask,
  onStopTask,
  onMarkComplete,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  getCategoryColor,
}) => {
  // Helper to format seconds into HH:MM:SS
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00' || i > 0) // Only show hours if not zero, or if minutes/seconds are shown
      .join(':') || '00:00'; // Default to 00:00 if all are zero
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-8">No tasks found. Add a new task to get started!</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center relative"
          >
            {/* Category Color Dot */}
            {task.category && (
              <span
                className="absolute -top-2 -left-2 w-4 h-4 rounded-full"
                style={{ backgroundColor: getCategoryColor(task.category) || '#ccc' }} // Fallback color
                title={task.category}
              ></span>
            )}

            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-sm mb-2">
                <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-200">
                  Due: {task.dueDate}{task.dueTime ? ` at ${task.dueTime}` : ''}
                </span>
                <span
                  className={`px-2 py-1 rounded-full font-medium
                    ${task.priority === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100' :
                      task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100'
                    }`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                <span
                  className={`px-2 py-1 rounded-full font-medium
                    ${task.status === 'completed' ? 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100' :
                      task.status === 'in-progress' ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                      'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                    }`}
                >
                  Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
                {task.category && (
                  <span
                    className="px-2 py-1 rounded-full text-white text-xs font-medium"
                    style={{ backgroundColor: getCategoryColor(task.category) || '#ccc' }}
                  >
                    {task.category}
                  </span>
                )}
                {task.isRecurring && (
                  <span className="bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                    Recurring ({task.recurrenceType} / {task.recurrenceInterval})
                  </span>
                )}
                {task.completedDate && (
                  <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-200 text-xs">
                    Completed: {task.completedDate}
                  </span>
                )}
                {/* Time Spent Display */}
                {task.timeSpent > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100 px-2 py-1 rounded-full text-xs font-medium">
                    Time Spent: {formatTime(task.timeSpent)}
                  </span>
                )}
                 {task.notificationPreference !== 'none' && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                      Notify: {task.notificationPreference === 'dueDate' ? 'On Due' : 'Custom Time'}
                      {task.notificationPreference === 'customTime' && task.customNotificationDate && task.customNotificationTime &&
                          ` (${task.customNotificationDate} ${task.customNotificationTime})`}
                    </span>
                )}
                 {task.trackingStartTime !== null && (
                    <span className="bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                        Tracking...
                    </span>
                )}
              </div>

              {/* Subtasks Section */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Subtasks:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {task.subtasks.map(sub => (
                      <li key={sub.id} className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => onToggleSubtask(task.id, sub.id)}
                            className="mr-2"
                          />
                          <span className={`${sub.completed ? 'line-through text-gray-500' : ''}`}>
                            {sub.title}
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteSubtask(task.id, sub.id)}
                          className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete subtask"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Add New Subtask Input */}
              <div className="flex mt-2">
                <input
                  type="text"
                  placeholder="Add new subtask..."
                  className="flex-grow p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md dark:bg-gray-700 dark:text-gray-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      onAddSubtask(task.id, e.currentTarget.value.trim());
                      e.currentTarget.value = ''; // Clear input
                    }
                  }}
                />
                <button
                  onClick={() => {
                    // Manually get value and clear, as we don't have controlled component for input
                    const input = document.querySelector(`input[placeholder="Add new subtask..."]`) as HTMLInputElement;
                    if (input && input.value.trim()) {
                      onAddSubtask(task.id, input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-r-md hover:bg-blue-700"
                >
                  +
                </button>
              </div>

            </div>

            {/* Actions Buttons */}
            <div className="flex-shrink-0 flex flex-col md:flex-row gap-2 mt-3 md:mt-0 md:ml-4">
              {/* Time Tracking Buttons */}
              {task.status !== 'completed' && (
                <>
                  {task.status !== 'in-progress' ? (
                    <button
                      onClick={() => onStartTask(task.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                      title="Start Tracking"
                    >
                      Start
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onPauseTask(task.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
                        title="Pause Tracking"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => onStopTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                        title="Stop Tracking & Reset Status"
                      >
                        Stop
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Mark Complete */}
              {task.status !== 'completed' && (
                <button
                  onClick={() => onMarkComplete(task.id)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  Complete
                </button>
              )}
              {/* Edit */}
              <button
                onClick={() => onEditTask(task)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              {/* Delete */}
              <button
                onClick={() => onDeleteTask(task.id)}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;