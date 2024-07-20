import express from 'express';
import {fetchTestTitlesByYear,fetchLevelsByYearAndTestTitle} from '../controllers/criteriaController.js';

const router = express.Router();

router.get('/testTitles/:year', fetchTestTitlesByYear);
router.get('/levels/:year/:testTitle',fetchLevelsByYearAndTestTitle);

export default router;