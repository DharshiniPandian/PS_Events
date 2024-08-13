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
 
    //                SELECT er.teamName, er.projectTitle
    // FROM team_members tm.name AS teamLeader, tm.rollno, er.level1
    // JOIN event_registration er ON tm.eventId = er.eventId
    // WHERE 

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
    SELECT 
      eligibleYears, criteria_id, departments
    FROM 
      events
    WHERE 
      name = ?`;

  db.query(query, [eventName], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results[0]);
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


export const getEligibleStudentsByYearAndCriteriaFromDb = (eligibleYear, criteria, departments, callback) => {
  console.log('Departments:', departments);

  const eligibleYearsArray = eligibleYear.split(',').map(year => parseInt(year, 10));
  const departmentsArray = departments.split(','); // assuming departments are passed as a comma-separated string

  let query = `
    SELECT * 
    FROM student 
    WHERE yearOfStudy IN (${eligibleYearsArray.map(() => '?').join(',')}) 
    AND department IN (${departmentsArray.map(() => '?').join(',')})
  `;
  const values = [...eligibleYearsArray, ...departmentsArray];

  eligibleYearsArray.forEach(year => {
    switch (year) {
      case 1:
        if (criteria.year1course && criteria.year1level) {
          query += ` AND (yearOfStudy != 1 OR (course = ? AND levelsCompleted >= ?))`;
          values.push(criteria.year1course, criteria.year1level);
        }
        break;
      case 2:
        if (criteria.year2course && criteria.year2level) {
          query += ` AND (yearOfStudy != 2 OR (course = ? AND levelsCompleted >= ?))`;
          values.push(criteria.year2course, criteria.year2level);
        }
        break;
      case 3:
        if (criteria.year3course && criteria.year3level) {
          query += ` AND (yearOfStudy != 3 OR (course = ? AND levelsCompleted >= ?))`;
          values.push(criteria.year3course, criteria.year3level);
        }
        break;
      case 4:
        if (criteria.year4course && criteria.year4level) {
          query += ` AND (yearOfStudy != 4 OR (course = ? AND levelsCompleted >= ?))`;
          values.push(criteria.year4course, criteria.year4level);
        }
        break;
      default:
        break;
    }
  });

  console.log('Query:', query);
  console.log('Values:', values);

  db.query(query, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      console.log('Results from getEligibleStudentsByYearAndCriteriaFromDb:', results);
      callback(null, results);
    }
  });
};


export const getRegisteredEventsFromDb = (email, callback) => {
  const query = `
      SELECT e.name, e.eventImage
      FROM team_members tm
      JOIN event_registration er ON tm.eventId = er.eventId
      JOIN events e ON er.eventName = e.name
      WHERE tm.email = ?
  `;

  // SELECT e.name, e.eventImage
  // FROM team_members tm
  // JOIN events e ON tm.eventId = e.id
  // WHERE tm.email = ?
    // SELECT e.name, e.eventImage
    //   FROM team_members tm
    //   JOIN event_registration er ON tm.eventId = er.eventId
    //   JOIN events e ON er.eventId = e.id
    //   WHERE tm.email = ?
  
  db.query(query, [email], (err, results) => {
      if (err) {
          return callback(err, null);
      }
      callback(null, results);
  });
};

export const getRegistrationStatusByEventAndStudentFromDb = (eventName, email, callback) => {
  const query = `
    SELECT tm.teamName, er.*
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

export const getEventDataFromDb = (eventName,email, callback) => {
  const query = `
   SELECT 
    tm.*,
    e.*,           
    er.*          
FROM 
    team_members tm
JOIN 
    event_registration er ON tm.eventId = er.eventId
JOIN 
    events e ON er.eventName = e.name
WHERE 
    e.name = ? 
    AND tm.email = ?

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
    SELECT er.*, r.*
    FROM team_members tm
    JOIN event_registration er ON tm.eventId = er.eventId
    LEFT JOIN report r ON er.eventId = r.eventId
    WHERE er.eventName = ? AND tm.email = ?
    ORDER BY r.reportID DESC
    LIMIT 1
  `;

  db.query(query, [eventName, email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    // Handle case where no report is found but return event registration details
    if (results.length === 0) {
      return callback(null, { 
        teamName: "",
        projectTitle: "",
        reSubmit: 0,
        document: null,
        geoTag: null,
        certificates: null,
        eventStatus: "",
        level: ""
      });
    }
    callback(null, results[0]);
  });
};


export const getEventByEventNameAndTeamName = (eventName, teamName, callback) => {
  const sql = 'SELECT eventID FROM event_registration WHERE eventName = ? AND teamName = ?';
  
  db.query(sql, [eventName, teamName], callback);
};

export const createReport = (reportData, callback) => {
  const { eventID, certificates, geoTag, document, eventStatus, level ,email} = reportData;
  const sql = 'INSERT INTO report (eventID, certificates, geoTag, document, eventStatus, level,email) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [eventID, certificates, geoTag, document, eventStatus, level, email], callback);
};

// export const updateLevel2Status = (eventID, callback) => {
//   const sql = 'UPDATE event_registration SET level2 = 1 WHERE eventID = ?';
//   db.query(sql, [eventID], callback);
// };

export const getRegistrationDetailsFromDB = (email, eventName, callback) => {
  const sql = `
    SELECT er.*
    FROM team_members tm
    JOIN event_registration er ON tm.eventId = er.eventId
    WHERE er.eventName = ? AND tm.email = ?
  `;
  
  db.query(sql, [eventName, email], callback);
};

export const updateRegistrationDetailsInDB = (email, eventName, projectTitle, projectObjective, existingMethodology, proposedMethodology, callback) => {
  const sql = `
    UPDATE event_registration er
    JOIN team_members tm ON tm.eventId = er.eventId
    SET er.projectTitle = ?, er.projectObjective = ?, er.existingMethodology = ?, er.proposedMethodology = ?, er.reSubmit = 0, er.reSubmitReason = NULL
    WHERE er.eventName = ? AND tm.email = ?
  `;
  db.query(sql, [projectTitle, projectObjective, existingMethodology, proposedMethodology, eventName, email], callback);
};

export const getStudentLevelByEmailAndEventID = (email, eventID, callback) => {
  const query = `
    SELECT 
      CASE
          WHEN er.level1Approval = 0 THEN 1
          WHEN er.level2Approval = 0 THEN 2
          WHEN er.level3Approval = 0 THEN 3
          WHEN er.level4Approval = 0 THEN 4
          ELSE 0
      END AS level
    FROM 
      event_registration er
    JOIN 
      team_members tm ON er.eventId = tm.eventId
    WHERE 
      tm.email = ? AND tm.eventId = ?;
  `;

  console.log('Email:', email);
  console.log('Event ID:', eventID);

  db.query(query, [email, eventID], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Student not found'), null);
    }
    callback(null, results[0].level);
  });
};

export const getReportDataByEventAndEmail = (eventId, email, callback) => {
  const query = `
    SELECT 
        r.*, 
        er.eventName, 
        er.teamName, 
        tm.email
    FROM 
        report r
    JOIN 
        event_registration er ON r.eventId = er.eventId
    JOIN 
        team_members tm ON er.eventId = tm.eventId AND r.email = tm.email
    WHERE 
        er.eventId = ? AND tm.email = ?;
  `;

  db.query(query, [eventId, email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

export const getReportDetailsByEventId = (eventId, callback) => {
  const query = `
    SELECT 
        r.*
    FROM 
        report r
    WHERE 
        eventId = ?;
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

export const updateReportDetailsByEventId = async (reportDetails) => {
  const { eventId, teamName, projectTitle, eventStatus, email, level, reportDocument, geoTagImage, certificates } = reportDetails;

  let query = 'UPDATE report r JOIN event_registration er ON r.eventID = er.eventId SET ';
  const updateFields = [];

  if (projectTitle) {
    query += 'er.projectTitle = ?, ';
    updateFields.push(projectTitle);
  }

  if (eventStatus) {
    query += 'r.eventStatus = ?, ';
    updateFields.push(eventStatus);
  }

  query += 'er.reSubmit = ?, ';
  updateFields.push(0);

  query += 'er.reSubmitReason = ?, ';
  updateFields.push(null);

  if (reportDocument) {
    query += 'r.document = ?, ';
    updateFields.push(reportDocument);
  }

  if (geoTagImage) {
    query += 'r.geoTag = ?, ';
    updateFields.push(geoTagImage);
  }

  if (certificates) {
    query += 'r.certificates = ?, ';
    updateFields.push(certificates);
  }

  query = query.slice(0, -2); // Remove the last comma and space
  query += ' WHERE r.eventID = ? AND er.teamName = ? AND r.level = ? AND r.email = ?';
  updateFields.push(eventId, teamName, level, email);

  console.log('SQL Query:', query);
  console.log('Query Parameters:', updateFields);

  try {
    const [result] = await db.promise().query(query, updateFields);
    console.log('Query Result:', result);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

export const getEventIdByTeamNameAndEventName = async (teamName, eventName) => {
  try {
    const query = 'SELECT eventId FROM event_registration WHERE teamName = ? AND eventName = ?';
    const [rows] = await db.promise().query(query, [teamName, eventName]);
    return rows.length ? rows[0].eventId : null;
  } catch (err) {
    console.error('Error fetching eventId:', err);
    throw err;
  }
};

export const getTeamMembersFromDB = (eventId, callback) => {
  const sql='SELECT * FROM team_members WHERE eventId = ?';
  db.query(sql,[eventId],callback);
}