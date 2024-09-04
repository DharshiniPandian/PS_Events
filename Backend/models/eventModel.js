// models/eventModel.js
import db from './db.js';

export const createEvent = (eventData, callback) => {
  const checkQuery = 'SELECT * FROM events WHERE name = ?';
  db.query(checkQuery, [eventData.name], (err, results) => {
    if (err) {
      return callback(err);
    }
    if (results.length > 0) {
      return callback(new Error('Event name already exists'));
    }
    const insertQuery = 'INSERT INTO events SET ?';
    db.query(insertQuery, eventData, callback);
  });
};


export const createCriteria = (criteriaData, callback) => {
  const query = 'INSERT INTO criteria SET ?';
  db.query(query, criteriaData, callback);
};

export const updateEvent1 = (eventId, eventData, callback) => {
  const query = 'UPDATE events SET ? WHERE id = ?';
  db.query(query, [eventData, eventId], callback);
};

export const getAllEvents = (callback) => {
  const sql = 'SELECT * FROM events';
  db.query(sql, (err, results) => {
    if (err) return callback(err);

    const events = results.map(event => {
      if (typeof event.departments === 'string') {
        event.departments = event.departments.split(',').map(department => department.trim());
      }
      return event;
    });

    callback(null, events);
  });
};

export const getEventById = (id, callback) => {
  const sql = `
    SELECT e.*, c.year1course, c.year1level, c.year2course, c.year2level, c.year3course, c.year3level, c.year4course, c.year4level
    FROM events e
    LEFT JOIN criteria c ON e.criteria_id = c.id
    WHERE e.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);

    if (results.length === 0) {
      return callback(null, []);
    }

    const event = results[0];
    if (typeof event.departments === 'string') {
      event.departments = event.departments.split(',').map(department => department.trim());
    }

    callback(null, event);
  });
};
export const updateEventById = (id, eventData, callback) => {
  const departmentsString = Array.isArray(eventData.departments) ? eventData.departments.join(',') : eventData.departments;

  const eventUpdate = {
    name: eventData.name,
    description: eventData.description,
    eventStartDate: eventData.eventStartDate,
    eventEndDate: eventData.eventEndDate,
    registrationStartDate: eventData.registrationStartDate,
    registrationEndDate: eventData.registrationEndDate,
    departments: departmentsString,
    eligibleYears: eventData.eligibleYears,
    teamSize: eventData.teamSize,
    eventMode: eventData.eventMode,
    eventLink: eventData.eventLink,
    eventImage: eventData.eventImage,
    eventNotice: eventData.eventNotice,
    levelCount: eventData.levelCount,
    level1description: eventData.levelDetails?.level1?.description || null,
    level1rewards: eventData.levelDetails?.level1?.rewards || null,
    level2description: eventData.levelDetails?.level2?.description || null,
    level2rewards: eventData.levelDetails?.level2?.rewards || null,
    level3description: eventData.levelDetails?.level3?.description || null,
    level3rewards: eventData.levelDetails?.level3?.rewards || null,
    level4description: eventData.levelDetails?.level4?.description || null,
    level4rewards: eventData.levelDetails?.level4?.rewards || null,
  };

  // Convert 'null' strings to actual null values
  for (const key in eventUpdate) {
    if (eventUpdate[key] === 'null') {
      eventUpdate[key] = null;
    }
  }

  const criteriaUpdate = {};

  if (eventData.criteria) {
    criteriaUpdate.year1course = eventData.criteria.year1?.course || null;
    criteriaUpdate.year1level = eventData.criteria.year1?.level || null;
    criteriaUpdate.year2course = eventData.criteria.year2?.course || null;
    criteriaUpdate.year2level = eventData.criteria.year2?.level || null;
    criteriaUpdate.year3course = eventData.criteria.year3?.course || null;
    criteriaUpdate.year3level = eventData.criteria.year3?.level || null;
    criteriaUpdate.year4course = eventData.criteria.year4?.course || null;
    criteriaUpdate.year4level = eventData.criteria.year4?.level || null;
  }

  // Convert 'null' strings to actual null values for criteria
  for (const key in criteriaUpdate) {
    if (criteriaUpdate[key] === 'null') {
      criteriaUpdate[key] = null;
    }
  }

  console.log('Criteria Update:', criteriaUpdate);  // Log the criteriaUpdate object
  console.log('Event Update:', eventUpdate);  // Log the eventUpdate object

  db.beginTransaction(err => {
    if (err) return callback(err);

    const updateCriteria = () => {
      db.query('UPDATE criteria SET ? WHERE id = (SELECT criteria_id FROM events WHERE id = ?)', [criteriaUpdate, id], (err, result) => {
        if (err) {
          console.error('Error updating criteria:', err);  // Log the error
          return db.rollback(() => {
            callback(err);
          });
        }
        updateEventDetails();
      });
    };

    const updateEventDetails = () => {
      db.query('UPDATE events SET ? WHERE id = ?', [eventUpdate, id], (err, result) => {
        if (err) {
          console.error('Error updating event details:', err);  // Log the error
          return db.rollback(() => {
            callback(err);
          });
        }

        db.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);  // Log the error
            return db.rollback(() => {
              callback(err);
            });
          }
          callback(null, result);
        });
      });
    };

    if (Object.keys(criteriaUpdate).length > 0) {
      updateCriteria();
    } else {
      updateEventDetails();
    }
  });
};
// const updateEventDetails = (eventUpdate, id, callback) => {
//   db.query('UPDATE events SET ? WHERE id = ?', [eventUpdate, id], (err, result) => {
//       if (err) {
//           return db.rollback(() => {
//               callback(err);
//           });
//       }

//       db.commit(err => {
//           if (err) {
//               return db.rollback(() => {
//                   callback(err);
//               });
//           }
//           callback(null, result);
//       });
//   });
// };


 //here
export const getEventsByDepartmentFromModel = (department, callback) => {
  const sql = `
  SELECT id, name, eventImage 
  FROM events 
  WHERE FIND_IN_SET(?, departments) 
  AND registrationEndDate >= CURDATE()
`;

  db.query(sql, [department], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err);
    }
    callback(null, results);
  });
};


//reference
export const checkCriteria = (eventId, yearOfStudy, email, callback) => {
  // Fetch student details including levelsCompleted
  const studentSql = 'SELECT levelsCompleted, course FROM student WHERE email = ?';
  db.query(studentSql, [email], (err, studentResults) => {
    if (err) return callback(err);

    if (studentResults.length === 0) {
      return callback(new Error('Student not found'));
    }

    const studentData = studentResults[0];
    const levelsCompleted = studentData.levelsCompleted; // Single integer representing highest level completed
    const course = studentData.course;

    // Fetch criteria for the event
    const criteriaSql = `
      SELECT c.*
      FROM criteria c
      JOIN events e ON c.id = e.criteria_id
      WHERE e.id = ?
    `;
    db.query(criteriaSql, [eventId], (err, criteriaResults) => {
      if (err) return callback(err);

      if (criteriaResults.length === 0) {
        return callback(null, false);
      }

      const criteria = criteriaResults[0];
      const isEligible = (
        (criteria.year1course === course && yearOfStudy === 1 && levelsCompleted >= criteria.year1level) ||
        (criteria.year2course === course && yearOfStudy === 2 && levelsCompleted >= criteria.year2level) ||
        (criteria.year3course === course && yearOfStudy === 3 && levelsCompleted >= criteria.year3level) ||
        (criteria.year4course === course && yearOfStudy === 4 && levelsCompleted >= criteria.year4level)
      );

      callback(null, isEligible);
    });
  });
};



//here
export const checkEventRegistration = (eventName, email, callback) => {
  if (typeof eventName !== 'string' || typeof email !== 'string') {
    return callback(new Error('Invalid input types'));
  }

  const sql = `
    SELECT er.*
    FROM event_registration er
    JOIN team_members tr ON tr.eventId = er.eventId
    WHERE er.eventName = ? AND tr.email = ?;
  `;
  
  db.query(sql, [eventName, email], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err);
    }
    callback(null, results.length > 0); // Adjust as needed to return a boolean or results
  });
};


//here
export const checkTeamMembership = (email, eventid, callback) => {
  if (typeof email !== 'string' || typeof eventid !== 'number' || typeof callback !== 'function') {
    return callback(new Error('Invalid input types'));
  }

  const sql = 'SELECT * FROM team_members WHERE email = ? AND eventId = ?';
  db.query(sql, [email, eventid], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err);
    }
    callback(null, results.length > 0);
  });
};



export const getTeamsForEvent = (eventName, callback) => {
  const sql = `
  SELECT er.*, e.*, r.*
  FROM event_registration er
  JOIN events e ON er.eventName = e.name
  LEFT JOIN (
    SELECT r.*
    FROM report r
    INNER JOIN (
      SELECT eventId, MAX(reportID) as latestReportID
      FROM report
      GROUP BY eventId
    ) lr ON r.eventId = lr.eventId AND r.reportID = lr.latestReportID
  ) r ON er.eventId = r.eventId
  WHERE e.name = ?;
  `;
  db.query(sql, [eventName], (err, results) => {
    if (err) {
      console.error('Error fetching teams for event:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

//here
export const getTeamDetails = (eventId, teamName, callback) => {
  const eventRegistrationQuery = `
 SELECT *
FROM event_registration
WHERE eventId = ? AND teamName = ?
  `;

  const teamMembersQuery = `
      SELECT 
        name, email, rollNo, year, department, isTeamLeader,reward_level1,reward_level2,reward_level3,reward_level4
      FROM team_members
      WHERE eventId = ? AND teamName = ?
    `;

  db.query(eventRegistrationQuery, [eventId, teamName], (err, eventResults) => {
    if (err) {
      console.error('Error fetching event registration details:', err);
      return callback(err);
    }
    if (eventResults.length === 0) {
      return callback(null, { error: 'Event or team not found' });
    }
    console.log(eventResults[0])

    const eventDetails = eventResults[0];

    db.query(teamMembersQuery, [eventId, teamName], (err, memberResults) => {
      if (err) {
        console.error('Error fetching team members details:', err);
        return callback(err);
      }

      const teamDetails = {
        ...eventDetails,
        members: memberResults
      };

      console.log(teamDetails)

      return callback(null, teamDetails);
    });
  });
};
//ok
export const approveTeamInModel = (eventId, teamName, callback) => {
  const sql = 'UPDATE event_registration SET RegistrationApproval = 1 WHERE eventId = ? AND teamName = ?';
  db.query(sql, [eventId, teamName], callback);
};
//ok
export const rejectTeamInModel = (eventId, teamName, rejectionReason, callback) => {
  const sql = 'UPDATE event_registration SET rejected = ? WHERE eventId = ? AND teamName = ?';
  db.query(sql, [rejectionReason, eventId, teamName], callback);
};

export const reSubmitTeamInModel = (eventId, teamName, reSubmitReason, callback) => {
  const sql = 'UPDATE event_registration SET reSubmit = ?, reSubmitReason = ? WHERE eventId = ? AND teamName = ?';
  console.log('Executing SQL:', sql);
  console.log('With parameters:', [1, reSubmitReason, eventId, teamName]);

  db.query(sql, [1, reSubmitReason, eventId, teamName], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
    } else {
      console.log('Query result:', result);
    }
    callback(err, result);
  });
};

export const getMemberId = (name, eventId, callback) => {
  const query = `SELECT memberId FROM team_members WHERE name = ? AND eventId = ?`;
  db.query(query, [name, eventId], (error, results) => {
    if (error) {
      return callback(error);
    }
    if (results.length === 0) {
      return callback(new Error('Member not found'));
    }
    callback(null, results[0].memberId);
  });
};

// Fetch distinct test titles by eligible year
export const getTestTitlesByYear = (year, callback = (err, res) => { if (err) throw err; }) => {
  const getTestTitlesQuery = `
    SELECT DISTINCT testTitle 
    FROM assessment 
    WHERE eligibleYear = ?
  `;
  db.query(getTestTitlesQuery, [year], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    console.log(results)
    return callback(null, results);
  });
};

export const getTeamSizeByEventName = (eventName, callback) => {
  const query = 'SELECT teamSize FROM events WHERE name = ?';
  db.query(query, [eventName], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};

export const getEligibleYearFromDb = (eventName, callback) => {
  const query = 'SELECT eligibleYears FROM events WHERE name = ?';
  db.query(query, [eventName], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Event not found'), null);
    }
    console.log(results[0]);
    callback(null, results[0]);
  });
};

export const getReportByEventID = (eventID, callback) => {
  const sql = 'SELECT r.*, er.* FROM report r JOIN event_registration er ON r.eventID = er.eventID WHERE r.eventID = ?';

  db.query(sql, [eventID], callback);
};

export const getLevel2ApprovalStatusFromDb = (eventId) => {
  const sql = 'SELECT level2Approval FROM event_registration WHERE eventId = ?';
  return new Promise((resolve, reject) => {
      db.query(sql, [eventId], (err, result) => {
          if (err) {
              return reject(err);
          }
          resolve(result[0]); 
      });
  });
};

export const getTeamMembersFromDb = (eventID) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM team_members WHERE eventId = ?';
    db.query(query, [eventID], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

export const assignRewardPoints = (memberId, rewardPoints) => {
  const sql = 'UPDATE team_members SET rewards = ? WHERE memberId = ?';
  console.log(memberId)
  console.log(rewardPoints)
  return new Promise((resolve, reject) => {
      db.query(sql, [rewardPoints, memberId], (err, result) => {
          if (err) return reject(err);
          if (result.affectedRows === 0) return reject(new Error('Member not found'));
          resolve(result);
      });
  });
};

export const updateEventLevel2Approval = (eventID) => {
  const sql = 'UPDATE event_registration SET level2Approval = 1 WHERE eventID = ?';
  return new Promise((resolve, reject) => {
      db.query(sql, [eventID], (err, result) => {
          if (err) return reject(err);
          resolve(result);
      });
  });
};

export const getEventToUpdateById = (id, callback) => {
  const sqlEvent = `
      SELECT *
      FROM events
      WHERE id = ?
  `;

  db.query(sqlEvent, [id], (err, eventResults) => {
      if (err) return callback(err);

      if (eventResults.length === 0) {
          return callback(null, []);
      }

      const event = eventResults[0];
      if (typeof event.departments === 'string') {
          event.departments = event.departments.split(',').map(department => department.trim());
      }

      const sqlCriteria = `
          SELECT *
          FROM criteria
          WHERE id = ?
      `;

      db.query(sqlCriteria, [event.criteria_id], (err, criteriaResults) => {
          if (err) return callback(err);

          if (criteriaResults.length === 0) {
              return callback(null, { ...event, criteria: {} });
          }

          const criteria = criteriaResults[0];

          const formattedCriteria = {
              year1: {
                  course: criteria.year1course,
                  level: criteria.year1level
              },
              year2: {
                  course: criteria.year2course,
                  level: criteria.year2level
              },
              year3: {
                  course: criteria.year3course,
                  level: criteria.year3level
              },
              year4: {
                  course: criteria.year4course,
                  level: criteria.year4level
              }
          };

          callback(null, { ...event, criteria: formattedCriteria });
      });
  });
};


export const updateApprovalStatus = (eventId, level) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE event_registration
      SET level${level}Approval = 1
      WHERE eventId = ? 
    `;
    db.query(sql, [eventId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Existing functions
export const getEventRewards = (eventId, level) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT e.level${level}rewards AS rewardPoints 
      FROM events e
      JOIN event_registration er ON e.name = er.eventName
      WHERE er.eventId = ? 
    `;
    db.query(sql, [eventId], (err, result) => {
      if (err) return reject(err);
      resolve(result[0]);
    });
  });
};

export const getTeamMembersByEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT memberId FROM team_members WHERE eventId = ? AND active=1';
    db.query(sql, [eventId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const updateRewardPoints = (memberId, rewardPoints, level) => {
  return new Promise((resolve, reject) => {
    const column = `reward_level${level}`;
    const sql = `UPDATE team_members SET ${column} = ? WHERE memberId = ? AND active=1`;
    db.query(sql, [rewardPoints, memberId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};


// Function to find registration by eventId and level
export const findRegistration = (eventId, level) => {
  const sql = 'SELECT * FROM event_registration WHERE eventId = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [eventId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Function to update resubmission details
export const updateResubmission = (eventId, level, reason) => {
  const sql = 'UPDATE event_registration SET reSubmitReason = ?, reSubmit = ? WHERE eventId = ? ';
  return new Promise((resolve, reject) => {
    db.query(sql, [reason, 1, eventId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
