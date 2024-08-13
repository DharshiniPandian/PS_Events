import express from 'express';
import {getTeamMembers,handleReportUpdate,getReportDetails,getReportData,updateRegistrationDetails,getRegistrationDetails,getStudentDetails, getEligibleStudentsList ,getTeamLeaderByEventIdAndTeamName,getEligibleYearAndCriteria,getEligibleStudentsByYearAndCriteria,getRegisteredEvents,getRegistrationStatus,getEventData,getProjectTitle,uploadReportFiles, handleReportSubmission } from '../controllers/studentController.js';

const router = express.Router();

router.get('/:email',getStudentDetails);
router.get('/eligible/:eligibleYear', getEligibleStudentsList);
router.get('/teams/:eventId/:teamName',getTeamLeaderByEventIdAndTeamName)
router.get('/events/getEligibleYear/:eventName', getEligibleYearAndCriteria);
router.get('/eligible/:eligibleYear/:criteriaId/:departments', getEligibleStudentsByYearAndCriteria);
router.get('/registered/:email', getRegisteredEvents);
router.get('/registration-status/:eventName/:email', getRegistrationStatus);
router.get('/events/getEventData/:eventName/:email/',getEventData);
router.get('/report/details',getProjectTitle);
router.post('/report/upload', uploadReportFiles, handleReportSubmission);
router.put('/report/update', uploadReportFiles, handleReportUpdate);
router.get('/registration-details/:email/:eventName',getRegistrationDetails);
router.put('/new-registration-details/:email/:eventName', updateRegistrationDetails);
router.get('/reports/:eventId/:email',getReportData);
router.get('/reports/:eventId',getReportDetails);
router.get('/team_members/:eventId',getTeamMembers);

export default router;
