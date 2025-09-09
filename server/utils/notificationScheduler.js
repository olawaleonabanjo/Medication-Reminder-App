import Notification from '../models/notification.model.js';
import { schedule } from 'node-cron';
import sendPushNotification from './pushNotication.js';

// Schedule notifications for a medication
export const scheduleNotifications = async (medication) => {
  try {
    await Notification.deleteMany({ medicationId: medication._id });

    if (!medication.isActive || new Date() < new Date(medication.startDate)) {
      return;
    }

    let scheduleTimes = [];

    if (medication.frequency === 'daily') {
      scheduleTimes = ['09:00'];
    } else if (medication.frequency === 'twice_daily') {
      scheduleTimes = ['09:00', '20:00'];
    } else if (medication.frequency === 'three_times_daily') {
      scheduleTimes = ['08:00', '14:00', '20:00'];
    } else if (medication.frequency === 'weekly') {
      scheduleTimes = ['09:00'];
    } else if (medication.frequency === 'custom' && medication.customSchedule) {
      scheduleTimes = medication.customSchedule.map((s) => s.time);
    }

    const now = new Date();
    const endDate = medication.endDate
      ? new Date(medication.endDate)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let currentDate = new Date(Math.max(now, new Date(medication.startDate)));

    while (currentDate <= endDate) {
      for (const time of scheduleTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const notificationTime = new Date(currentDate);
        notificationTime.setHours(hours, minutes, 0, 0);

        if (notificationTime > now) {
          await Notification.create({
            userId: medication.userId,
            medicationId: medication._id,
            scheduledTime: notificationTime,
            method: 'push',
          });
        }
      }

      if (medication.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log(`Scheduled ${scheduleTimes.length} notifications for medication: ${medication.name}`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

// Send pending notifications (run every minute)
schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const pendingNotifications = await Notification.find({
      scheduledTime: { $gte: now, $lte: fiveMinutesFromNow },
      sent: false,
    }).populate('medicationId', 'name dosage');

    for (const notification of pendingNotifications) {
      try {
        await sendPushNotification(
          notification.userId,
          `Time to take your medication!`,
          `${notification.medicationId.name} - ${notification.medicationId.dosage}`
        );

        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();

        console.log(`Sent notification for medication: ${notification.medicationId.name}`);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
});
