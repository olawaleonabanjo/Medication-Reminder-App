import express from 'express';
import { 
  getMedications, 
  getMedication, 
  createMedication, 
  updateMedication, 
  deleteMedication 
} from '../controllers/medication.controller.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// Protect all medication routes
router.use(authorize);

router.get('/', getMedications);
router.get('/:id', getMedication);
router.post('/', createMedication);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

export default router;