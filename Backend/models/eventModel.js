// models/eventModel.js
import db from './db.js';

export const createEvent = (eventData, callback) => {
  const query = 'INSERT INTO events SET ?';
  db.query(query, eventData, callback);
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
  const sql = 'SELECT * FROM events WHERE id = ?';
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
  const sql = 'UPDATE events SET ? WHERE id = ?';
  db.query(sql, [eventData, id], callback);
};
 //here
export const getEventsByDepartmentFromModel = (department, callback) => {
  const sql = 'SELECT id, name, eventImage FROM events WHERE FIND_IN_SET(?, departments)';

  db.query(sql, [department], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

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
export const checkEventRegistration = (eventName, callback) => {
  if (typeof eventName !== 'string') {
    return callback(new Error('Invalid input types'));
  }

  const sql = 'SELECT * FROM event_registration WHERE eventName = ?';
  db.query(sql, [eventName], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return callback(err);
    }
    callback(null, results.length > 0);
  });
};

//here
export const checkTeamMembership = (email, eventid, callback) => {
  if (typeof email !== 'string' || typeof eventid !== 'number') {
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
  const sql = 'SELECT * FROM event_registration WHERE eventName = ?';
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
 SELECT 
  eventId, eventName, teamName, projectTitle, projectObjective, 
  existingMethodology, proposedMethodology, teamSize
FROM event_registration
WHERE eventId = ? AND teamName = ?
  `;

  const teamMembersQuery = `
      SELECT 
        name, email, rollNo, year, department, isTeamLeader
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
  const sql = 'UPDATE event_registration SET level1 = 1 WHERE eventId = ? AND teamName = ?';
  db.query(sql, [eventId, teamName], callback);
};
//ok
export const rejectTeamInModel = (eventId, teamName, rejectionReason, callback) => {
  const sql = 'UPDATE event_registration SET rejected = ? WHERE eventId = ? AND teamName = ?';
  db.query(sql, [rejectionReason, eventId, teamName], callback);
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

export const storeReward = (rewards, callback) => {
  const query = `INSERT INTO rewards_summary (memberId, eventId, level1) VALUES ?`;
  const values = rewards.map(reward => [reward.memberId, reward.eventId, reward.level1]);

  db.query(query, [values], (error, results) => {
    callback(error, results);
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