import { getStudentByEmail1,getEligibleStudentsListFromDb,getTeamLeaderByEventIdAndTeamNameFromDb, getEligibleYearAndCriteriaFromDb,getEligibleStudentsByYearAndCriteriaFromDb,getCriteriaDetailsFromDb,getRegisteredEventsFromDb, getRegistrationStatusByEventAndStudentFromDb, getEventDateFromDb, getProjectTitleFromDb,getEventByEventNameAndTeamName,createReport} from '../models/studentModel.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export const uploadReportFiles = upload.fields([
  { name: 'reportDocument', maxCount: 1 },
  { name: 'geoTagImage', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]);

export const handleReportSubmission = async (req, res) => {
try {
  const { projectTitle, eventName, teamName } = req.body;
  console.log('Report Submission Data:', req.body);

  // Handling file uploads
  const reportDocument = req.files['reportDocument'] ? req.files['reportDocument'][0].path.replace(/\\/g, '/') : null;
  const geoTagImage = req.files['geoTagImage'] ? req.files['geoTagImage'][0].path.replace(/\\/g, '/') : null;
  const certificates = req.files['certificates'] ? req.files['certificates'][0].path.replace(/\\/g, '/') : null;

  // Get eventID based on eventName and teamName
  const eventResult = await new Promise((resolve, reject) => {
    getEventByEventNameAndTeamName(eventName, teamName, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  if (eventResult.length === 0) {
    throw new Error('Event not found');
  }

  const eventID = eventResult[0].eventID;

  const reportData = {
    eventID,
    certificates,
    geoTag: geoTagImage,
    document: reportDocument
  };

  // Insert report data into the report table
  await new Promise((resolve, reject) => {
    createReport(reportData, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  res.status(201).json({ message: 'Report submitted successfully' });
} catch (error) {
  console.error('Error in handleReportSubmission:', error);
  res.status(500).json({ error: 'Failed to submit report' });
}
};


export const getStudentDetails = (req, res) => {
    const { email } = req.params;
    getStudentByEmail1(email,(err,result) => {
        if (err) return res.status(500).json({ error: 'Database error fetching teams' });
        res.status(200).json(result);
    })
};

// export const getEligibleStudents = async (req, res) => {
//     const { eligibleYear } = req.params;
//     const { eventName } = req.query;
  
//     try {
//       const students = await getEligibleStudentsFromDb(eligibleYear, eventName);
//       res.json(students);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
  export const getEligibleStudentsList = (req, res) => {
    const { years } = req.params;
    
    // Convert comma-separated string to array of integers
    const yearArray = years.split(',').map(year => parseInt(year, 10));
  
    getEligibleStudentsListFromDb(yearArray, (err, students) => {
      if (err) {
        console.error('Error fetching students from DB:', err);
        return res.status(500).json({ error: 'Failed to fetch eligible students' });
      }
      res.status(200).json(students);
    });
  };

  export const getTeamLeaderByEventIdAndTeamName = (req, res) => {
    const { eventId, teamName } = req.params;
    console.log(`Received eventId: ${eventId}, teamName: ${teamName}`);
    
    getTeamLeaderByEventIdAndTeamNameFromDb(eventId, teamName, (err, leader) => {
        if (err) {
            console.error('Error fetching team leader from DB:', err);
            return res.status(500).json({ error: 'Error fetching team leader details' });
        }
        if (leader) {
            res.status(200).json(leader);
        } else {
            res.status(404).json({ error: 'Team leader not found' });
        }
    });
};

// Controller to get eligible year and criteria
export const getEligibleYearAndCriteria = (req, res) => {
  const eventName = req.params.eventName;

  getEligibleYearAndCriteriaFromDb(eventName, (error, data) => {
    if (error) {
      console.error('Error fetching eligible year and criteria:', error);
      res.status(500).json({ error: 'Failed to fetch eligible year and criteria' });
    } else {
      if (!data || !data.criteria_id) {
        return res.status(404).json({ error: 'Criteria ID not found' });
      }
      console.log(data)
     
      const year=data.eligibleYears; // Correctly extract criteria_id
      const criteriaId = data.criteria_id;
     
      res.json({ eligibleYear: year, criteria_id : criteriaId });
     
    }
  });
};

// Controller to get eligible students based on year and criteria
export const getEligibleStudentsByYearAndCriteria = (req, res) => {
  const { eligibleYear, criteriaId } = req.params;

  getCriteriaDetailsFromDb(criteriaId, (criteriaError, criteriaData) => {
    if (criteriaError) {
      console.error('Error fetching criteria details:', criteriaError);
      res.status(500).json({ error: 'Failed to fetch criteria details' });
    } else {
      getEligibleStudentsByYearAndCriteriaFromDb(eligibleYear, criteriaData, (error, students) => {
        if (error) {
          console.error('Error fetching eligible students:', error);
          res.status(500).json({ error: 'Failed to fetch eligible students' });
        } else {
          res.json(students);
        }
      });
    }
  });
};

export const getRegisteredEvents = (req, res) => {
  const { email } = req.params;
  
  getRegisteredEventsFromDb(email, (err, events) => {
      if (err) {
          console.error('Error fetching registered events:', err);
          return res.status(500).json({ error: 'Failed to fetch registered events' });
      }
      res.status(200).json(events);
  });
};

export const getRegistrationStatus = (req, res) => {
  const { eventName ,email} = req.params;
  // Assuming email is sent as a query parameter

  getRegistrationStatusByEventAndStudentFromDb(eventName, email, (err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching registration status' });
    }
    res.status(200).json(status);
  });
};

export const getEventDate = (req, res) => {
  const { eventName,email} = req.params;
  
  getEventDateFromDb(eventName, email,(err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching registration status' });
    }
    res.status(200).json(status);
  });
};

export const getProjectTitle = (req, res) => {
  const { eventName, email } = req.query;
  getProjectTitleFromDb(eventName, email,(err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching registration status' });
    }
    console.log(status)
    res.status(200).json(status);
  });
};