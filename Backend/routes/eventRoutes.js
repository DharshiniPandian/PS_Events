import express from 'express';
import {  resubmit1,reSubmit,getEventToUpdate,uploadEventFiles, handleEventUpload, getEvent, getEvents, updateEvent,  getStudentEvents ,fetchTeamsForEvent,fetchTeamDetails ,approveTeam, rejectTeam, fetchTestTitlesByYear,getTeamSize,getEligibleYear, handleGetReportByEventID,getTeamMembers,assignRewards,getLevel2ApprovalStatus} from '../controllers/eventController.js';
//import { fetchTeamsForEvent } from '../controllers/registrationController.js';
// import { getStudentDepartment } from '../controllers/studentController.js';

const router = express.Router();

// router.get('/students', getStudentDepartment);
router.get('/student-events', getStudentEvents);
// router.get('/department', getEventsByDepartment); 

router.post('/upload', uploadEventFiles, handleEventUpload);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/update/:id', getEventToUpdate);
// router.get('/department', getEventsByDepartment); 
router.put('/:id', uploadEventFiles, updateEvent);


router.get('/:eventName/teams', fetchTeamsForEvent);
router.get('/:eventId/teams/:teamName', fetchTeamDetails);
router.put('/:eventId/teams/:teamName/approve', approveTeam);
router.put('/:eventId/teams/:teamName/reject', rejectTeam);
router.put('/:eventId/teams/:teamName/reSubmit', reSubmit);
// router.post('/rewards', storeRewards);
router.get('/testTitles/:year', fetchTestTitlesByYear);
router.get('/teamSize/:eventName', getTeamSize);
router.get('/getEligibleYear/:eventName',getEligibleYear);
router.get('/report/:eventID', handleGetReportByEventID);
router.get('/team-members/:eventId',getTeamMembers);
// router.post('/rewards', assignRewards);
router.post('/assign-rewards', assignRewards);
// GET request to fetch levels by year
router.get('/team-members/level2Approval/:eventId', getLevel2ApprovalStatus);
router.post('/resubmit1', resubmit1);




export default router;
