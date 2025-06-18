// src/components/CalendarView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Task } from '../interfaces/Task';

interface CalendarViewProps {
  tasks: Task[];
  onAddTaskForDay: (date: string) => void; // Function to add a task for a specific day
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTaskForDay }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendarDays = useMemo(() => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear); // Get 0-indexed day of week

    const days = [];
    const today = new Date();
    const todayDate = today.getDate();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    // Fill leading empty days
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Fill days of the month
    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTasks = tasks.filter(task => task.dueDate === dateString);
      const isToday = isCurrentMonth && i === todayDate;

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day border rounded-md p-2 flex flex-col justify-between cursor-pointer transition-colors duration-200
            ${isToday ? 'bg-blue-200 dark:bg-blue-700 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
            hover:bg-gray-100 dark:hover:bg-gray-700/50
            `}
          onClick={() => onAddTaskForDay(dateString)} // Click to add task for this day
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-800 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>
            {i}
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-20 sm:max-h-28">
            {dayTasks.length > 0 ? (
              dayTasks.map(task => (
                <div
                  key={task.id}
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis
                    ${task.status === 'completed' ? 'bg-green-300 text-green-900 dark:bg-green-700 dark:text-green-100' :
                       task.priority === 'high' ? 'bg-red-300 text-red-900 dark:bg-red-700 dark:text-red-100' :
                       task.priority === 'medium' ? 'bg-yellow-300 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100' :
                       'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200'
                     }
                  `}
                  title={`${task.title} (${task.status})`}
                  // Consider adding an onClick to view/edit task details here later
                >
                  {task.title}
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No tasks</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  }, [currentMonth, currentYear, tasks, onAddTaskForDay]); // Re-render if month/year/tasks change

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
    if (currentMonth === 0) {
      setCurrentYear(prevYear => prevYear - 1);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
    if (currentMonth === 11) {
      setCurrentYear(prevYear => prevYear + 1);
    }
  };

  return (
    <div className="calendar-view bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="calendar-header flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Previous
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={goToNextMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Next
        </button>
      </div>

      <div className="calendar-grid-header grid grid-cols-7 gap-2 text-center font-bold text-gray-700 dark:text-gray-300 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid grid grid-cols-7 gap-2">
        {renderCalendarDays}
      </div>
    </div>
  );
};

export default CalendarView;