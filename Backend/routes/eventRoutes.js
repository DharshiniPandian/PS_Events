import express from 'express';
import { uploadEventFiles, handleEventUpload, getEvent, getEvents, updateEvent,  getStudentEvents ,fetchTeamsForEvent,fetchTeamDetails ,approveTeam, rejectTeam, storeRewards,fetchTestTitlesByYear,getTeamSize,getEligibleYear} from '../controllers/eventController.js';
//import { fetchTeamsForEvent } from '../controllers/registrationController.js';
// import { getStudentDepartment } from '../controllers/studentController.js';

const router = express.Router();

// router.get('/students', getStudentDepartment);
router.get('/student-events', getStudentEvents);
// router.get('/department', getEventsByDepartment); 

router.post('/upload', uploadEventFiles, handleEventUpload);
router.get('/', getEvents);
router.get('/:id', getEvent);
// router.get('/department', getEventsByDepartment); 
router.put('/:id', uploadEventFiles, updateEvent);


router.get('/:eventName/teams', fetchTeamsForEvent);
router.get('/:eventId/teams/:teamName', fetchTeamDetails);
router.put('/:eventId/teams/:teamName/approve', approveTeam);
router.put('/:eventId/teams/:teamName/reject', rejectTeam);
router.post('/rewards', storeRewards);
router.get('/testTitles/:year', fetchTestTitlesByYear);
router.get('/teamSize/:eventName', getTeamSize);
router.get('/getEligibleYear/:eventName',getEligibleYear);
// GET request to fetch levels by year




export default router;
