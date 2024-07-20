import db from './db.js';
//ok
export const getStudentByEmail = (email, callback) => {
    const sql = 'SELECT * FROM student WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

//ok
export const getStudentByEmail1 = (email, callback) => {
    const sql = 'SELECT * FROM student WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// export const getEligibleStudentsFromDb = async (eligibleYear, eventName) => {
//     try {
//       const [rows] = await db.query(
//         `SELECT * FROM students WHERE yearOfStudy = ? AND rollno NOT IN (
//            SELECT rollno FROM registrations WHERE eventName = ?
//         )`,
//         [eligibleYear, eventName]
//       );
//       return rows;
//     } catch (error) {
//       throw new Error('Error fetching eligible students: ' + error.message);
//     }
//   };

  //ok
  export const getEligibleStudentsListFromDb = (years, callback) => {
    // Use IN (?) with an array for SQL query
    const query = 'SELECT * FROM students WHERE yearOfStudy IN (?)';
    db.query(query, [years], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  };

  export const getTeamLeaderByEventIdAndTeamNameFromDb = (eventId, teamName, callback) => {
    const query = `SELECT name AS teamLeader, rollNo FROM team_members 
                   WHERE eventId = ? AND teamName = ? AND isTeamLeader = 1`;
    console.log(`Query: ${query}`);
    console.log(`Parameters: ${eventId}, ${teamName}`);
    
    db.query(query, [eventId, teamName], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        console.log('Query results:', results[0]);
        callback(null, results[0]);
    });
};

export const getEligibleYearAndCriteriaFromDb = (eventName, callback) => {
  const query = `
    SELECT eligibleYears, criteria_id 
    FROM events 
    WHERE name = ?
  `;
  db.query(query, [eventName], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      console.log('Results from getEligibleYearAndCriteriaFromDb:', results); // Log to verify
      callback(null, results[0]); // Assuming results[0] contains the data
    }
  });
};

export const getCriteriaDetailsFromDb = (criteriaId, callback) => {
  const query = `
    SELECT * 
    FROM criteria 
    WHERE id = ?
  `;
  db.query(query, [criteriaId], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      console.log('Criteria details from getCriteriaDetailsFromDb:', results[0]); // Log to verify
      callback(null, results[0]);
    }
  });
};

export const getEligibleStudentsByYearAndCriteriaFromDb = (eligibleYear, criteria, callback) => {
  let query = `
    SELECT * 
    FROM student 
    WHERE yearOfStudy = ?
  `;
  const values = [eligibleYear];

  if (criteria) {
    switch (eligibleYear) {
      case 1:
        if (criteria.year1course && criteria.year1level) {
          query += ` AND course = ? AND levelsCompleted >= ?`;
          values.push(criteria.year1course, criteria.year1level);
        }
        break;
      case 2:
        if (criteria.year2course && criteria.year2level) {
          query += ` AND course = ? AND levelsCompleted >= ?`;
          values.push(criteria.year2course, criteria.year2level);
        }
        break;
      case 3:
        if (criteria.year3course && criteria.year3level) {
          query += ` AND course = ? AND levelsCompleted >= ?`;
          values.push(criteria.year3course, criteria.year3level);
        }
        break;
      case 4:
        if (criteria.year4course && criteria.year4level) {
          query += ` AND course = ? AND levelsCompleted >= ?`;
          values.push(criteria.year4course, criteria.year4level);
        }
        break;
      default:
        break;
    }
  }

  console.log('Query:', query); // Log query for debugging
  console.log('Values:', values); // Log values for debugging

  db.query(query, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      console.log('Results from getEligibleStudentsByYearAndCriteriaFromDb:', results); // Log results for debugging
      callback(null, results);
    }
  });
};

export const getRegisteredEventsFromDb = (email, callback) => {
  const query = `
      SELECT e.name, e.eventImage
      FROM team_members tm
      JOIN events e ON tm.eventId = e.id
      WHERE tm.email = ?
  `;
  
  db.query(query, [email], (err, results) => {
      if (err) {
          return callback(err, null);
      }
      callback(null, results);
  });
};

export const getRegistrationStatusByEventAndStudentFromDb = (eventName, email, callback) => {
  const query = `
    SELECT tm.teamName, er.level1, e.name AS eventName, er.rejected
    FROM team_members tm
    JOIN event_registration er ON tm.eventId = er.eventId
    JOIN events e ON er.eventName = e.name
    WHERE e.name = ? AND tm.email = ?
  `;

  db.query(query, [eventName, email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('No registration found for the given event and email'), null);
    }
    callback(null, results[0]);
  });
};

export const getEventDateFromDb = (eventName,email, callback) => {
  const query = `
    SELECT tm.isTeamLeader,e.eventStartDate
    FROM team_members tm
    JOIN event_registration er ON tm.eventId = er.eventId
    JOIN events e ON er.eventName = e.name
    WHERE e.name = ? AND tm.email = ?
  `;

  db.query(query, [eventName,email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Event Name not found'), null);
    }
    callback(null, results[0]);
  });
};

export const getProjectTitleFromDb = (eventName, email, callback) => {
  const query = `
    SELECT er.teamName, er.projectTitle
    FROM team_members tm
    JOIN event_registration er ON tm.eventId = er.eventId
    WHERE er.eventName = ? AND tm.email = ?
  `;

  db.query(query, [eventName, email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Event not found'), null);
    }
    callback(null, results[0]);
  });
};

export const getEventByEventNameAndTeamName = (eventName, teamName, callback) => {
  const sql = 'SELECT eventID FROM event_registration WHERE eventName = ? AND teamName = ?';
  
  db.query(sql, [eventName, teamName], callback);
};

export const createReport = (reportData, callback) => {
  const { eventID, certificates, geoTag, document } = reportData;
  const sql = 'INSERT INTO report (eventID, certificates, geoTag, document) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [eventID, certificates, geoTag, document], callback);
};