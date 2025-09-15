import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FontAwesomeIcon 
} from '@fortawesome/react-fontawesome';
import { 
  faPills, 
  faClock, 
  faCalendar, 
  faStickyNote,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import '../styles/MedicationForm.css';

export default function AddMedication() {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    customSchedule: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  const [customTime, setCustomTime] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCustomTime = () => {
    if (!customTime) {
      toast.error('Please enter a time');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      customSchedule: [...prev.customSchedule, { time: customTime }]
    }));
    setCustomTime('');
  };

  const removeCustomTime = (index) => {
    setFormData(prev => ({
      ...prev,
      customSchedule: prev.customSchedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dosage) {
      toast.error('Please fill in medication name and dosage');
      return;
    }
    
    if (formData.frequency === 'custom' && formData.customSchedule.length === 0) {
      toast.error('Please add at least one time for custom schedule');
      return;
    }
    
    setLoading(true);
    
    try {
      const medicationData = {
        ...formData,
        customSchedule: formData.frequency === 'custom' ? formData.customSchedule : undefined
      };
      
      await medicationApi.create(medicationData);
      toast.success('Medication added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to add medication');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medication-form-container">
      <header className="form-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn"
          aria-label="Go back"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Add New Medication</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="medication-form">
        <div className="form-section">
          <h2>Medication Details</h2>
          
          <div className="form-group">
            <label htmlFor="name">
              <FontAwesomeIcon icon={faPills} className="icon" />
              Medication Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Ibuprofen, Insulin, etc."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dosage">
              <FontAwesomeIcon icon={faPills} className="icon" />
              Dosage
            </label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g., 200mg, 1 tablet, 10 units"
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Schedule</h2>
          
          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="daily">Once Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="three_times_daily">Three Times Daily</option>
              <option value="weekly">Once Weekly</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>
          
          {formData.frequency === 'custom' && (
            <div className="form-group custom-schedule">
              <label>
                <FontAwesomeIcon icon={faClock} className="icon" />
                Custom Times
              </label>
              <div className="custom-time-input">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="HH:MM"
                />
                <button 
                  type="button" 
                  onClick={addCustomTime}
                  className="add-time-btn"
                >
                  Add
                </button>
              </div>
              
              {formData.customSchedule.length > 0 && (
                <div className="custom-times-list">
                  <h4>Added Times:</h4>
                  {formData.customSchedule.map((time, index) => (
                    <div key={index} className="custom-time-item">
                      <span>{time.time}</span>
                      <button 
                        type="button" 
                        onClick={() => removeCustomTime(index)}
                        className="remove-time-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <FontAwesomeIcon icon={faCalendar} className="icon" />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">
                <FontAwesomeIcon icon={faCalendar} className="icon" />
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="notes">
              <FontAwesomeIcon icon={faStickyNote} className="icon" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions, side effects to watch for, etc."
              rows="4"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Medication'}
          </button>
        </div>
      </form>
    </div>
  );
}