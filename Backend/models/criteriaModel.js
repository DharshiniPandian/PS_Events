import db from './db.js';1

export const getTestTitlesByYear = (year) => {
    const getTestTitlesQuery = `
        SELECT DISTINCT testTitle 
        FROM assessment 
        WHERE eligibleYear = ?
    `;
    return new Promise((resolve, reject) => {
        db.query(getTestTitlesQuery, [year], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.map(result => result.testTitle));
        });
    });
};

export const getLevelsByYearAndTestTitle = (year, testTitle) => {
    const getLevelsQuery = `
        SELECT levelCount 
        FROM assessment 
        WHERE eligibleYear = ? AND testTitle = ?
    `;
    return new Promise((resolve, reject) => {
        db.query(getLevelsQuery, [year, testTitle], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length === 0) {
                return reject(new Error('No levels found for the given year and test title.'));
            }
            const levelCount = results[0].levelCount;
            // Generate an array of levels based on levelCount
            const levels = Array.from({ length: levelCount }, (_, index) => index + 1);
            resolve(levels);
        });
    });
};