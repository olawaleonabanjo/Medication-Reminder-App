import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { medicationApi } from '../services/api';
import { toast } from 'react-toastify';
import { 
  format, 
  isToday, 
  isPast, 
  parseISO 
} from 'date-fns';
import { 
  FontAwesomeIcon 
} from '@fortawesome/react-fontawesome';
import { 
  faPills, 
  faClock, 
  faCalendar, 
  faStickyNote,
  faEdit,
  faTrash,
  faChevronLeft,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import '../styles/MedicationDetail.css';

export default function MedicationDetail() {
  const { id } = useParams();
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchMedication = async () => {
    try {
      setLoading(true);
      const response = await medicationApi.getById(id);
      setMedication(response.data);
    } catch (error) {
      toast.error('Failed to load medication details');
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedication();
  },);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      await medicationApi.delete(id);
      toast.success('Medication deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete medication');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!medication) return;
    
    try {
      const updatedMedication = await medicationApi.update(id, {
        isActive: !medication.isActive
      });
      setMedication(updatedMedication.data);
      toast.success(`Medication ${updatedMedication.data.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update medication status');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    return format(date, 'MMM d, yyyy');
  };

  const formatFrequency = (freq) => {
    switch (freq) {
      case 'daily': return 'Once Daily';
      case 'twice_daily': return 'Twice Daily';
      case 'three_times_daily': return 'Three Times Daily';
      case 'weekly': return 'Once Weekly';
      case 'custom': return 'Custom Schedule';
      default: return freq;
    }
  };

  if (loading) {
    return (
      <div className="medication-detail-container">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faPills} spin size="3x" />
          <p>Loading medication details...</p>
        </div>
      </div>
    );
  }

  if (!medication) {
    return null;
  }

  return (
    <div className="medication-detail-container">
      <header className="detail-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn"
          aria-label="Go back"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>{medication.name}</h1>
        <div className="header-actions">
          <button 
            onClick={handleToggleActive}
            className={`toggle-btn ${medication.isActive ? 'active' : 'inactive'}`}
            title={medication.isActive ? 'Deactivate medication' : 'Activate medication'}
          >
            <FontAwesomeIcon icon={medication.isActive ? faToggleOn : faToggleOff} />
          </button>
          <Link 
            to={`/medications/${id}/edit`} 
            className="edit-btn"
            title="Edit medication"
          >
            <FontAwesomeIcon icon={faEdit} />
          </Link>
        </div>
      </header>
      
      <div className="detail-content">
        <div className="detail-card">
          <div className="detail-row">
            <div className="detail-label">
              <FontAwesomeIcon icon={faPills} className="icon" />
              Dosage
            </div>
            <div className="detail-value">{medication.dosage}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">
              <FontAwesomeIcon icon={faClock} className="icon" />
              Frequency
            </div>
            <div className="detail-value">{formatFrequency(medication.frequency)}</div>
          </div>
          
          {medication.frequency === 'custom' && medication.customSchedule && (
            <div className="detail-row">
              <div className="detail-label">Schedule</div>
              <div className="detail-value">
                {medication.customSchedule.map((time, index) => (
                  <span key={index} className="schedule-time">
                    {time.time}
                    {index < medication.customSchedule.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="detail-row">
            <div className="detail-label">
              <FontAwesomeIcon icon={faCalendar} className="icon" />
              Start Date
            </div>
            <div className="detail-value">{formatDate(medication.startDate)}</div>
          </div>
          
          {medication.endDate && (
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faCalendar} className="icon" />
                End Date
              </div>
              <div className="detail-value">
                {formatDate(medication.endDate)}
                {isPast(parseISO(medication.endDate)) && (
                  <span className="expired-tag"> (Expired)</span>
                )}
              </div>
            </div>
          )}
          
          {medication.notes && (
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faStickyNote} className="icon" />
                Notes
              </div>
              <div className="detail-value notes">{medication.notes}</div>
            </div>
          )}
          
          <div className="detail-row">
            <div className="detail-label">Status</div>
            <div className={`detail-value status ${medication.isActive ? 'active' : 'inactive'}`}>
              {medication.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <Link 
            to={`/medications/${id}/edit`} 
            className="edit-btn full-width"
          >
            <FontAwesomeIcon icon={faEdit} />
            Edit Medication
          </Link>
          
          <button 
            onClick={handleDelete}
            className="delete-btn full-width"
            disabled={deleting}
          >
            <FontAwesomeIcon icon={faTrash} />
            {deleting ? 'Deleting...' : 'Delete Medication'}
          </button>
        </div>
      </div>
    </div>
  );
}