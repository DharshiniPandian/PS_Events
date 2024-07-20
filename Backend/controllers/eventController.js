import { createEvent,checkCriteria,updateEvent1, createCriteria,getAllEvents, getEventById, updateEventById, getEventsByDepartmentFromModel, getTeamsForEvent, getTeamDetails,approveTeamInModel, rejectTeamInModel, getMemberId,storeReward,checkEventRegistration ,checkTeamMembership,getTeamSizeByEventName,getEligibleYearFromDb} from '../models/eventModel.js';
import { getStudentByEmail } from '../models/studentModel.js';
import multer from 'multer';
import path from 'path';
import { formatISO } from 'date-fns';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

export const uploadEventFiles = upload.fields([
    { name: 'eventNotice', maxCount: 1 },
    { name: 'eventImage', maxCount: 1 }
]);

export const handleEventUpload = async (req, res) => {
  try {
    const eventData = req.body;

    // Handling file uploads for event notice and image
    if (req.files['eventNotice']) {
      eventData.eventNotice = req.files['eventNotice'][0].path.replace(/\\/g, '/');
    }
    if (req.files['eventImage']) {
      eventData.eventImage = req.files['eventImage'][0].path.replace(/\\/g, '/');
    }

    // Remove criteria from eventData before inserting into the events table
    const criteria = eventData.criteria;
    delete eventData.criteria;

    // Convert teamSize to integer
    eventData.teamSize = parseInt(eventData.teamSize, 10);

    if (isNaN(eventData.teamSize)) {
      throw new Error('Invalid teamSize value');
    }

    console.log('Event Data:', eventData);

    // Insert event data into the events table
    const eventResult = await new Promise((resolve, reject) => {
      createEvent(eventData, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const eventId = eventResult.insertId;

    // Prepare criteria data based on the eligible years
    const criteriaData = {
      year1course: null,
      year1level: null,
      year2course: null,
      year2level: null,
      year3course: null,
      year3level: null,
      year4course: null,
      year4level: null
    };

    // Manually check and assign values to criteria fields
    criteria.forEach(item => {
      if (item) {
        const level = parseInt(item.level, 10);
        switch (level) {
          case 1:
            criteriaData.year1course = item.testTitle || null;
            criteriaData.year1level = level || null;
            break;
          case 2:
            criteriaData.year2course = item.testTitle || null;
            criteriaData.year2level = level || null;
            break;
          case 3:
            criteriaData.year3course = item.testTitle || null;
            criteriaData.year3level = level || null;
            break;
          case 4:
            criteriaData.year4course = item.testTitle || null;
            criteriaData.year4level = level || null;
            break;
          default:
            break;
        }
      }
    });

    console.log('Criteria Data:', criteriaData);

    let criteriaId = null;

    // Insert criteria data into the criteria table if available
    if (Object.values(criteriaData).some(value => value !== null)) {
      const criteriaResult = await new Promise((resolve, reject) => {
        createCriteria(criteriaData, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      criteriaId = criteriaResult.insertId;
    }

    console.log('Criteria ID:', criteriaId);

    // Update event with criteria_id if criteria were inserted
    if (criteriaId) {
      await new Promise((resolve, reject) => {
        updateEvent1(eventId, { criteria_id: criteriaId }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    res.status(201).json({ message: 'Event created successfully', eventId: eventId });
  } catch (error) {
    console.error('Error in handleEventUpload:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};



export const getEvents = (req, res) => {
    getAllEvents((err, results) => {
        if (err) {
            console.error('Error retrieving events:', err);
            res.status(500).json({ error: 'Failed to retrieve events' });
        } else {
            res.status(200).json(results);
        }
    });
};

export const getEvent = (req, res) => {
    const { id } = req.params;
    getEventById(id, (err, event) => {
        if (err) {
            console.error('Error retrieving event:', err);
            return res.status(500).json({ error: 'Failed to retrieve event' });
        }
        if (!event || Object.keys(event).length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    });
};

export const updateEvent = (req, res) => {
    const { id } = req.params;
    const eventData = req.body;

    // Convert dates to MySQL acceptable format
    if (eventData.eventStartDate) {
        eventData.eventStartDate = formatISO(new Date(eventData.eventStartDate), { representation: 'date' });
    }
    if (eventData.eventEndDate) {
        eventData.eventEndDate = formatISO(new Date(eventData.eventEndDate), { representation: 'date' });
    }
    if (eventData.registrationStartDate) {
        eventData.registrationStartDate = formatISO(new Date(eventData.registrationStartDate), { representation: 'date' });
    }
    if (eventData.registrationEndDate) {
        eventData.registrationEndDate = formatISO(new Date(eventData.registrationEndDate), { representation: 'date' });
    }

    if (req.files['eventNotice']) {
        eventData.eventNotice = req.files['eventNotice'][0].path.replace(/\\/g, '/');
    }
    if (req.files['eventImage']) {
        eventData.eventImage = req.files['eventImage'][0].path.replace(/\\/g, '/');
    }

    updateEventById(id, eventData, (err, result) => {
        if (err) {
            console.error('Error updating event:', err);
            return res.status(500).json({ error: 'Failed to update event' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event updated successfully' });
    });
};

export const getStudentEvents = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Step 1: Fetch student data
  getStudentByEmail(email, (err, studentResults) => {
    if (err) {
      console.error('Error retrieving student data:', err);
      return res.status(500).json({ error: 'Failed to retrieve student data' });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = studentResults[0];
    const department = studentData.department;
    const yearOfStudy = studentData.yearOfStudy;

    // Step 2: Fetch events by department
    getEventsByDepartmentFromModel(department, (err, eventsResults) => {
      if (err) {
        console.error('Error retrieving events by department:', err);
        return res.status(500).json({ error: 'Failed to retrieve events' });
      }

      const filteredEvents = [];

      const checkRegistrationsAndCriteria = (index) => {
        if (index >= eventsResults.length) {
          return res.status(200).json({
            department,
            events: filteredEvents
          });
        }

        const event = eventsResults[index];

        // Step 3: Check if the student is registered for the event
        checkEventRegistration(event.name, (err, isRegistered) => {
          if (err) {
            console.error('Error checking event registration:', err);
            return res.status(500).json({ error: 'Failed to check event registration' });
          }

          if (isRegistered) {
            return checkRegistrationsAndCriteria(index + 1);
          }

          // Step 4: Check event criteria
          checkCriteria(event.id, yearOfStudy, email, (err, isEligible) => {
            if (err) {
              console.error('Error checking event criteria:', err);
              return res.status(500).json({ error: 'Failed to check event criteria' });
            }

            if (isEligible) {
              filteredEvents.push(event);
            }

            checkRegistrationsAndCriteria(index + 1);
          });
        });
      };

      checkRegistrationsAndCriteria(0);
    });
  });
};


export const fetchTeamsForEvent = (req, res) => {
    const { eventName } = req.params;
    getTeamsForEvent(eventName, (err, teams) => {
        if (err) return res.status(500).json({ error: 'Database error fetching teams' });
        res.status(200).json(teams);
    });
};

export const fetchTeamDetails = (req, res) => {
    const { eventId, teamName } = req.params;
    getTeamDetails(eventId, teamName, (err, teamDetails) => {
        if (err) return res.status(500).json({ error: 'Database error fetching team details' });
        if (!teamDetails) return res.status(404).json({ error: 'Team not found' });
        res.status(200).json(teamDetails);
    });
};

export const approveTeam = (req, res) => {
    const { eventId, teamName } = req.params;
    approveTeamInModel(eventId, teamName, (err) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json({ message: 'Team approved successfully' });
    });
  };
  
  export const rejectTeam = (req, res) => {
    const { eventId, teamName } = req.params;
    const { rejectionReason } = req.body;
    rejectTeamInModel(eventId, teamName, rejectionReason, (err) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json({ message: 'Team rejected successfully' });
    });
  };

  export const storeRewards = async (req, res) => {
    const rewards = req.body.rewards;
  
    try {
      const rewardsWithIds = await Promise.all(rewards.map(async reward => {
        return new Promise((resolve, reject) => {
          getMemberId(reward.name, reward.eventId, (error, memberId) => {
            if (error) {
              return reject(error);
            }
            resolve({
              memberId,
              eventId: reward.eventId,
              level1: reward.level1
            });
          });
        });
      }));
  
      storeReward(rewardsWithIds, (error, results) => {
        if (error) {
          console.error('Error storing rewards:', error);
          return res.status(500).send('Error storing rewards');
        }
        res.status(200).send('Rewards stored successfully');
      });
    } catch (error) {
      console.error('Error fetching member IDs:', error);
      res.status(500).send('Error fetching member IDs');
    }
  };

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
  
  export const getTeamSize = (req, res) => {
    const { eventName } = req.params;
    
    getTeamSizeByEventName(eventName, (error, result) => {
      if (error) {
        console.error('Error fetching team size:', error);
        return res.status(500).json({ error: 'Failed to fetch team size' });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.status(200).json(result[0]); // Assuming only one row is returned
    });
  };
  
  export const getEligibleYear = (req, res) => {
    const { eventName } = req.params;
  
    getEligibleYearFromDb(eventName, (err, event) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Failed to fetch eligible year' });
      }
      if (!event) {
        console.log('No event found for:', eventName);
        return res.status(404).json({ error: 'Event not found' });
      }
      console.log("From controller")
      console.log(event.eligibleYears)
      res.status(200).json({ eligibleYear: event.eligibleYears });
    });
  };