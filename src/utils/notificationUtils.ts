// src/utils/notificationUtils.ts

// 1. Import necessary types from interfaces/Task.ts
//    Remove 'NotificationPreference' as it's not directly used in this file's logic.
import type { Task } from '../interfaces/Task';

// 2. Define NotificationPermission type if it's not globally available
type NotificationPermission = 'granted' | 'denied' | 'default';

// 3. Define NotificationOptions type if it's not globally available
interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  renotify?: boolean;
  // actions?: NotificationAction[];
  // badge?: string;
  // dir?: NotificationDirection;
  // image?: string;
  // silent?: boolean;
  // timestamp?: DOMTimeStamp;
  // vibrate?: VibratePattern;
}


// Exported function to request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  // Check if Notification API is supported by the browser
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications.");
    return 'denied'; // Fallback to 'denied' if not supported
  }

  // Return current permission if already granted or denied
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn("Notification permission was denied. Please change browser settings.");
    return 'denied';
  }

  // Request permission if it's in 'default' state
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return 'denied';
  }
};

// Exported function to check tasks and send notifications
export const checkAndNotifyTasks = (tasks: Task[], updateTask: (id: string, updates: Partial<Task>) => void) => {
  const now = new Date(); // Current time

  tasks.forEach(task => {
    // Skip tasks that are completed or for which notification has already been sent
    if (task.status === 'completed' || task.notificationSent) {
      return;
    }

    let notificationTime: Date;

    // Determine notification time based on preference
    if (task.notificationPreference === 'dueDate' && task.dueDate) {
      const timePart = task.dueTime ? task.dueTime : '00:00';
      const dateTimeString = `${task.dueDate}T${timePart}:00`; // Format:<ctrl42>-MM-DDTHH:mm:00
      notificationTime = new Date(dateTimeString);
    } else if (task.notificationPreference === 'customTime' && task.customNotificationDate && task.customNotificationTime) {
      const dateTimeString = `${task.customNotificationDate}T${task.customNotificationTime}:00`; // Format:<ctrl42>-MM-DDTHH:mm:00
      notificationTime = new Date(dateTimeString);
    } else {
      // If preference is 'none' or required date/time parts are missing, skip
      return;
    }

    // Validate the created Date object. If it's invalid, log error and skip.
    if (isNaN(notificationTime.getTime())) {
      console.error(`Invalid Date encountered for task "${task.title}". Task ID: ${task.id}`);
      console.error(`Debug Info: DueDate: ${task.dueDate}, DueTime: ${task.dueTime}, CustomDate: ${task.customNotificationDate}, CustomTime: ${task.customNotificationTime}`);
      return;
    }

    // Check if the notification time is now or in the past
    if (notificationTime.getTime() <= now.getTime()) {
      sendNotification(task);
      // Update task to mark notification as sent to prevent re-notifying
      updateTask(task.id, { notificationSent: true });
    }
  });
};

// Helper function to send a single notification
const sendNotification = (task: Task) => {
  // Only send if permission is granted
  if (Notification.permission === 'granted') {
    const title = `Task Reminder: ${task.title}`;
    const options: NotificationOptions = {
      body: `Due: ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ''}. Priority: ${task.priority.toUpperCase()}`,
      // icon: '/path/to/your/icon.png', // Uncomment and set if you have an icon
      tag: task.id,
      renotify: true,
    };

    new Notification(title, options);
  }
};