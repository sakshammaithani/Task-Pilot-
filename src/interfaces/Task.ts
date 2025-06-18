// taskpilot-frontend/src/interfaces/Task.ts

export type TaskStatus = 'pending' | 'in-progress' | 'paused' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type NotificationPreference = 'none' | 'dueDate' | 'customDate';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimeLog {
  startTime: number; // Unix timestamp
  endTime: number | null; // Unix timestamp, null if ongoing
}

export interface Task {
  id: string;
  userId: string; // <--- ADD THIS LINE
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  status: TaskStatus;
  category?: string; // Name of the category
  notificationPreference: NotificationPreference;
  customNotificationDate?: string; // YYYY-MM-DD
  customNotificationTime?: string; // HH:MM
  timeSpent: number; // in seconds
  trackingStartTime: number | null; // Unix timestamp when tracking started, null if not tracking
  notificationSent: boolean; // To track if notification has been sent for this task's current due date
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  subtasks?: Subtask[];
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number; // e.g., every 1 day, 2 weeks
  recurrenceEndDate?: string | null; // YYYY-MM-DD
  timeLogs?: TimeLog[];
  completedDate?: string;
}

export interface Category {
  id: string;
  userId: string; // <--- ADD THIS LINE AS WELL, for consistency
  name: string;
  color: string;
  createdAt: number; // <--- ADD THIS LINE
  updatedAt: number; // <--- ADD THIS LINE
}