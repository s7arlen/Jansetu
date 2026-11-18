import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const createNotification = async ({
  userId,
  complaintId = null,
  complaintCode = '',
  title,
  message,
  type = 'info',
}) => {
  try {
    const notification = await Notification.create({
      userId,
      complaintId,
      complaintCode,
      title,
      message,
      type,
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

export const notifyAdmins = async ({
  complaintId = null,
  complaintCode = '',
  title,
  message,
  type = 'warning',
}) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      complaintId,
      complaintCode,
      title,
      message,
      type,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Error notifying admins:', err.message);
  }
};

export const notifyDepartmentOfficials = async ({
  departmentId,
  complaintId = null,
  complaintCode = '',
  title,
  message,
  type = 'info',
}) => {
  try {
    const officials = await User.find({ role: 'official', departmentId });
    const notifications = officials.map((off) => ({
      userId: off._id,
      complaintId,
      complaintCode,
      title,
      message,
      type,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Error notifying department officials:', err.message);
  }
};
