import {getTestTitlesByYear,getLevelsByYearAndTestTitle} from '../models/criteriaModel.js';

export const fetchTestTitlesByYear = async (req, res) => {
    const { year } = req.params;
    try {
      const testTitles = await getTestTitlesByYear(year);
      res.status(200).json(testTitles);
    } catch (error) {
      console.error('Error fetching test titles:', error);
      res.status(500).json({ error: 'Failed to fetch test titles' });
    }
};

export const fetchLevelsByYearAndTestTitle = async (req, res) => {
    const { year, testTitle } = req.params;
    try {
      const levels = await getLevelsByYearAndTestTitle(year, testTitle);
      res.status(200).json(levels);
    } catch (error) {
      console.error('Error fetching levels:', error);
      res.status(500).json({ error: 'Failed to fetch levels' });
    }
};


