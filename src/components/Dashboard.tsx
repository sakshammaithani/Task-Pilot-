// src/components/Dashboard.tsx
import React from 'react';
import type { Task, TaskStatus, TaskPriority } from '../interfaces/Task';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  // Calculate task counts by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  // Calculate task counts by priority
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<TaskPriority, number>);

  // Calculate upcoming tasks (due in next 7 days, not completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  const upcomingTasks = tasks.filter(task => {
    if (task.status === 'completed') return false; // Exclude completed tasks
    const dueDate = new Date(`${task.dueDate}T${task.dueTime || '00:00'}`); // Parse date and time
    dueDate.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0); // Normalize due date for comparison

    return dueDate >= today && dueDate <= next7Days;
  }).length;

  // Calculate overdue tasks (due date in the past, not completed)
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false; // Exclude completed tasks
    const dueDate = new Date(`${task.dueDate}T${task.dueTime || '23:59'}`); // Use end of day if no time
    dueDate.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0); // Normalize due date for comparison

    return dueDate < today;
  }).length;

  // Helper for dashboard card styling
  const cardStyle = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center min-h-[120px]";
  const valueStyle = "text-4xl font-bold text-blue-600 dark:text-blue-400";
  const labelStyle = "text-md text-gray-600 dark:text-gray-300";

  return (
    <div className="dashboard-view grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Total Tasks Card */}
      <div className={cardStyle}>
        <div className={valueStyle}>{tasks.length}</div>
        <div className={labelStyle}>Total Tasks</div>
      </div>

      {/* Overdue Tasks Card */}
      <div className={cardStyle}>
        <div className={`${valueStyle} ${overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{overdueTasks}</div>
        <div className={labelStyle}>Overdue Tasks</div>
      </div>

      {/* Upcoming Tasks Card */}
      <div className={cardStyle}>
        <div className={valueStyle}>{upcomingTasks}</div>
        <div className={labelStyle}>Upcoming (7 Days)</div>
      </div>

      {/* Tasks by Status */}
      <div className={`${cardStyle} col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1`}>
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">By Status</h3>
        <ul className="text-left w-full max-w-xs mx-auto">
          <li className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">Pending:</span>
            <span className="text-blue-500 dark:text-blue-300">{tasksByStatus.pending || 0}</span>
          </li>
          <li className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">In Progress:</span>
            <span className="text-green-500 dark:text-green-300">{tasksByStatus['in-progress'] || 0}</span>
          </li>
          <li className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">Paused:</span>
            <span className="text-yellow-500 dark:text-yellow-300">{tasksByStatus.paused || 0}</span>
          </li>
          <li className="flex justify-between py-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
            <span className="text-purple-500 dark:text-purple-300">{tasksByStatus.completed || 0}</span>
          </li>
        </ul>
      </div>

      {/* Tasks by Priority */}
      <div className={`${cardStyle} col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1`}>
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">By Priority</h3>
        <ul className="text-left w-full max-w-xs mx-auto">
          <li className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">High:</span>
            <span className="text-red-500 dark:text-red-300">{tasksByPriority.high || 0}</span>
          </li>
          <li className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">Medium:</span>
            <span className="text-orange-500 dark:text-orange-300">{tasksByPriority.medium || 0}</span>
          </li>
          <li className="flex justify-between py-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Low:</span>
            <span className="text-blue-500 dark:text-blue-300">{tasksByPriority.low || 0}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;