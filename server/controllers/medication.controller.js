import Medication from '../models/medication.model.js';
import Notification from '../models/notification.model.js';
import { scheduleNotifications } from '../utils/notificationScheduler.js';

// @desc    Get all medications for current user
// @route   GET /api/medications
// @access  Private
export const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private
export const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private
export const createMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, customSchedule, startDate, endDate, notes } = req.body;
    
    const medication = new Medication({
      userId: req.user.id,
      name,
      dosage,
      frequency,
      customSchedule: frequency === 'custom' ? customSchedule : undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes
    });
    
    await medication.save();
    
    // Schedule notifications for this medication
    await scheduleNotifications(medication);
    
    res.status(201).json(medication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
export const updateMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, customSchedule, startDate, endDate, notes, isActive } = req.body;
    
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Update fields
    medication.name = name || medication.name;
    medication.dosage = dosage || medication.dosage;
    medication.frequency = frequency || medication.frequency;
    medication.customSchedule = frequency === 'custom' ? customSchedule : medication.customSchedule;
    medication.startDate = startDate ? new Date(startDate) : medication.startDate;
    medication.endDate = endDate ? new Date(endDate) : medication.endDate;
    medication.notes = notes || medication.notes;
    medication.isActive = isActive !== undefined ? isActive : medication.isActive;
    
    await medication.save();
    
    // Reschedule notifications if needed
    if (isActive !== false) {
      await scheduleNotifications(medication);
    }
    
    res.json(medication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
export const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Delete associated notifications
    await Notification.deleteMany({ medicationId: medication._id });
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};