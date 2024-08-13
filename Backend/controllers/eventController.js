import {updateResubmission, findRegistration,updateApprovalStatus,getEventRewards,updateRewardPoints, getTeamMembersByEvent,  reSubmitTeamInModel, getEventToUpdateById,createEvent,checkCriteria,updateEvent1, createCriteria,getAllEvents, getEventById, updateEventById, getEventsByDepartmentFromModel, getTeamsForEvent, getTeamDetails,approveTeamInModel, rejectTeamInModel, getMemberId,checkEventRegistration ,checkTeamMembership,getTeamSizeByEventName,getEligibleYearFromDb,getReportByEventID,getTeamMembersFromDb,assignRewardPoints, updateEventLevel2Approval, getLevel2ApprovalStatusFromDb} from '../models/eventModel.js';
import { getStudentByEmail } from '../models/studentModel.js';
import multer from 'multer';
import path from 'path';
import { formatISO } from 'date-fns';
import { error } from 'console';

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
      const criteria = eventData.criteria ? JSON.parse(eventData.criteria) : [];
      delete eventData.criteria;

      // Validate and parse descriptions and rewards
      const descriptions = eventData.descriptions ? JSON.parse(eventData.descriptions) : [];
      const rewards = eventData.rewards ? JSON.parse(eventData.rewards) : [];

      // Remove descriptions and rewards if not needed in the events table
      delete eventData.descriptions;
      delete eventData.rewards;

      // Convert teamSize to integer
      eventData.teamSize = parseInt(eventData.teamSize, 10);
      if (isNaN(eventData.teamSize)) {
          throw new Error('Invalid teamSize value');
      }

      console.log('Event Data:', eventData);

      // Extract level details
      const levelCount = parseInt(eventData.levelCount, 10);
      if (isNaN(levelCount) || levelCount < 1 || levelCount > 4) {
          throw new Error('Invalid levelCount value');
      }

      // Set default values for level descriptions and rewards
      const levels = {
          level1description: descriptions[0] || '-',
          level1rewards: parseInt(rewards[0], 10) || 0,
          level2description: descriptions[1] || '-',
          level2rewards: parseInt(rewards[1], 10) || 0,
          level3description: descriptions[2] || '-',
          level3rewards: parseInt(rewards[2], 10) || 0,
          level4description: descriptions[3] || '-',
          level4rewards: parseInt(rewards[3], 10) || 0
      };

      // Add level count
      eventData.levelCount = levelCount;

      // Insert event data into the events table
      const eventResult = await new Promise((resolve, reject) => {
          createEvent({ ...eventData, ...levels }, (err, result) => {
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
              const year = parseInt(item.year, 10);
              const level = typeof item.level === 'string' ? item.level : item.level[item.testTitle];
              switch (year) {
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
      if(error==="Event name already exists")
        res.status(500).json({ message: 'Event name already exists' });
      res.status(500).json({ message: 'Failed to create event' });
  }
};



// export const handleEventUpload = async (req, res) => {
//   try {
//       const eventData = req.body;

//       // Handling file uploads for event notice and image
//       if (req.files['eventNotice']) {
//           eventData.eventNotice = req.files['eventNotice'][0].path.replace(/\\/g, '/');
//       }
//       if (req.files['eventImage']) {
//           eventData.eventImage = req.files['eventImage'][0].path.replace(/\\/g, '/');
//       }

//       // Remove criteria from eventData before inserting into the events table
//       const criteria = JSON.parse(eventData.criteria);
//       delete eventData.criteria;

//       // Convert teamSize to integer
//       eventData.teamSize = parseInt(eventData.teamSize, 10);

//       if (isNaN(eventData.teamSize)) {
//           throw new Error('Invalid teamSize value');
//       }

//       console.log('Event Data:', eventData);

//       // Insert event data into the events table
//       const eventResult = await new Promise((resolve, reject) => {
//           createEvent(eventData, (err, result) => {
//               if (err) return reject(err);
//               resolve(result);
//           });
//       });

//       const eventId = eventResult.insertId;

//       console.log('Event ID:', eventId);

//       // Insert criteria data into the criteria1 table
//       if (criteria && criteria.length > 0) {
//           for (const item of criteria) {
//               if (item) {
//                   const year = parseInt(item.year, 10);
//                   const level = typeof item.level === 'string' ? item.level : item.level[item.testTitle];
//                   const criteriaData = {
//                       eventId: eventId,
//                       year: year,
//                       testTitle: item.testTitle || null,
//                       level: level || null
//                   };

//                   console.log('Criteria Data:', criteriaData);

//                   await new Promise((resolve, reject) => {
//                       createCriteria1(criteriaData, (err, result) => {
//                           if (err) return reject(err);
//                           resolve(result);
//                       });
//                   });
//               }
//           }
//       }

//       res.status(201).json({ message: 'Event created successfully', eventId: eventId });
//   } catch (error) {
//       console.error('Error in handleEventUpload:', error);
//       res.status(500).json({ error: 'Failed to create event' });
//   }
// };



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

export const getEventToUpdate = (req, res) => {
  const { id } = req.params;
  getEventToUpdateById(id, (err, event) => {
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
  console.log("Request Body:", req.body);
  
  const eventData = req.body.eventData ? JSON.parse(req.body.eventData) : {};

  if (!eventData) {
    return res.status(400).json({ error: 'No event data provided' });
  }

  // Handle file uploads
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

  console.log("Email received: ", email); // Debug email parameter

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Fetch student data
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

    // Fetch events by department
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

        // Check if the student is registered for the event
        checkEventRegistration(event.name, email, (err, isRegistered) => {
          if (err) {
            console.error('Error checking event registration:', err);
            return res.status(500).json({ error: 'Failed to check event registration' });
          }

          if (isRegistered) {
            return checkRegistrationsAndCriteria(index + 1);
          }

          // Check event criteria
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

  export const reSubmit = (req, res) => {
    const { eventId, teamName } = req.params;
    const { reSubmitReason } = req.body;
  
    console.log("Request to resubmit:");
    console.log("Event ID:", eventId);
    console.log("Team Name:", teamName);
    console.log("Reason:", reSubmitReason);
  
    reSubmitTeamInModel(eventId, teamName, reSubmitReason, (err, result) => {
      if (err) {
        console.error("Error updating the database:", err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Resubmit request was made successfully' });
    });
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

  export const handleGetReportByEventID = async (req, res) => {
    try {
        const { eventID } = req.params;

        const reportResult = await new Promise((resolve, reject) => {
            getReportByEventID(eventID, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (reportResult.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json(reportResult);
    } catch (error) {
        console.error('Error in handleGetReportByEventID:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};
export const getTeamMembers = async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await getTeamMembersFromDb(eventId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export const assignRewards = async (req, res) => {
  const { eventId, level } = req.body;

  try {
    // Fetch event rewards
    const event = await getEventRewards(eventId, level);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalRewardPoints = event.rewardPoints;

    // Fetch team members
    const teamMembers = await getTeamMembersByEvent(eventId);

    if (teamMembers.length === 0) {
      return res.status(404).json({ error: 'No team members found for this event' });
    }

    const rewardPerMember = Math.floor(totalRewardPoints / teamMembers.length);

    // Assign rewards to team members
    await Promise.all(teamMembers.map(member => {
      return updateRewardPoints(member.memberId, rewardPerMember, level);
    }));

    // Update the approval status
    await updateApprovalStatus(eventId, level);

    res.status(200).json({ message: 'Rewards assigned and approval status updated successfully' });
  } catch (error) {
    console.error('Error in assigning rewards:', error);
    res.status(500).json({ error: 'Failed to assign rewards' });
  }
};

export const getLevel2ApprovalStatus = async (req, res) => {
  const { eventId } = req.params;
  try {
      const status = await getLevel2ApprovalStatusFromDb(eventId);
      res.status(200).json(status);
  } catch (error) {
      console.error('Error fetching Status:', error);
      res.status(500).json({ error: 'Failed to fetch status' });
  }
};

export const resubmit1 = async (req, res) => {
  const { eventId, level, reason } = req.body;

  try {
    const registration = await findRegistration(eventId, level);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    await updateResubmission(eventId, level, reason);

    res.status(200).json({ message: 'Resubmission reason submitted successfully!' });
  } catch (error) {
    console.error('Error in resubmit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};