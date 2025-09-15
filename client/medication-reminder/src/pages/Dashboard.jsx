import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { medicationApi } from '../services/api';
import { toast } from 'react-toastify';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { 
  FontAwesomeIcon 
} from '@fortawesome/react-fontawesome';
import { 
  faPills, 
  faPlus, 
  faSignOutAlt,
  faBell,
  faCalendar,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [medications, setMedications] = useState([]);
  const [upcomingDoses, setUpcomingDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
      toast.info('Logged out successfully');
    } catch (error) {
      console.log(error)
      toast.error('Logout failed');
    }
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationApi.getAll();
      setMedications(response.data);
      
      // Calculate upcoming doses (next 24 hours)
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const upcoming = response.data
        .filter(med => med.isActive)
        .map(med => {
          // Generate next dose times based on frequency
          let nextDoses = [];
          
          if (med.frequency === 'daily') {
            nextDoses = [new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)];
          } else if (med.frequency === 'twice_daily') {
            nextDoses = [
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0),
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0)
            ];
          } else if (med.frequency === 'three_times_daily') {
            nextDoses = [
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0),
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0)
            ];
          } else if (med.frequency === 'weekly') {
            nextDoses = [new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 9, 0, 0)];
          } else if (med.frequency === 'custom' && med.customSchedule) {
            nextDoses = med.customSchedule.map(s => {
              const [hours, minutes] = s.time.split(':').map(Number);
              return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
            });
          }
          
          // Filter for doses in the next 24 hours
          return nextDoses
            .filter(doseTime => doseTime >= now && doseTime <= next24Hours)
            .map(doseTime => ({
              medication: med,
              time: doseTime
            }));
        })
        .flat()
        .sort((a, b) => a.time - b.time);
      
      setUpcomingDoses(upcoming);
    } catch (error) {
      toast.error('Failed to load medications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMedications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const formatTime = (date) => {
    return format(date, 'h:mm a');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faPills} spin size="3x" />
          <p>Loading your medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>MediRemind</h1>
        <div className="user-info">
          <span>Hello, {currentUser?.username}</span>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </header>
      
      <div className="upcoming-section">
        <div className="section-header">
          <FontAwesomeIcon icon={faBell} className="section-icon" />
          <h2>Upcoming Doses</h2>
        </div>
        
        {upcomingDoses.length > 0 ? (
          <div className="upcoming-list">
            {upcomingDoses.map((dose, index) => (
              <div key={index} className="dose-card">
                <div className="dose-info">
                  <h3>{dose.medication.name}</h3>
                  <p className="dosage">{dose.medication.dosage}</p>
                  <div className="dose-time">
                    <FontAwesomeIcon icon={faClock} />
                    <span>{formatTime(dose.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-upcoming">
            <FontAwesomeIcon icon={faCalendar} size="2x" />
            <p>No doses scheduled in the next 24 hours</p>
          </div>
        )}
      </div>
      
      <div className="medications-section">
        <div className="section-header">
          <FontAwesomeIcon icon={faPills} className="section-icon" />
          <h2>My Medications</h2>
          <Link to="/medications/add" className="add-btn">
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        </div>
        
        {medications.length > 0 ? (
          <div className="medications-grid">
            {medications.map(med => (
              <Link 
                to={`/medications/${med._id}`} 
                key={med._id} 
                className={`medication-card ${!med.isActive ? 'inactive' : ''}`}
              >
                <div className="medication-header">
                  <h3>{med.name}</h3>
                  {med.isActive ? (
                    <span className="status active">Active</span>
                  ) : (
                    <span className="status inactive">Inactive</span>
                  )}
                </div>
                <p className="dosage">{med.dosage}</p>
                <div className="medication-footer">
                  <span className="frequency">{med.frequency.replace('_', ' ')}</span>
                  <span className="start-date">Starts: {formatDate(med.startDate)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-medications">
            <FontAwesomeIcon icon={faPills} size="3x" />
            <p>You have not added any medications yet</p>
            <Link to="/medications/add" className="primary-btn">
              Add Your First Medication
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}