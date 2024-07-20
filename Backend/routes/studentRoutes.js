import express from 'express';
import {getStudentDetails, getEligibleStudentsList ,getTeamLeaderByEventIdAndTeamName,getEligibleYearAndCriteria,getEligibleStudentsByYearAndCriteria,getRegisteredEvents,getRegistrationStatus,getEventDate,getProjectTitle,uploadReportFiles, handleReportSubmission } from '../controllers/studentController.js';

const router = express.Router();

router.get('/:email',getStudentDetails);
router.get('/eligible/:eligibleYear', getEligibleStudentsList);
router.get('/teams/:eventId/:teamName',getTeamLeaderByEventIdAndTeamName)
router.get('/events/getEligibleYear/:eventName', getEligibleYearAndCriteria);
router.get('/eligible/:eligibleYear/:criteriaId', getEligibleStudentsByYearAndCriteria);
router.get('/registered/:email', getRegisteredEvents);
router.get('/registration-status/:eventName/:email', getRegistrationStatus);
router.get('/events/getEventDate/:eventName/:email/',getEventDate);
router.get('/report/details',getProjectTitle);
router.post('/report/upload', uploadReportFiles, handleReportSubmission);

export default router;
