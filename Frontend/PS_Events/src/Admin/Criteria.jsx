import React from 'react';

function Criteria({
  year,
  testTitles,
  levels,
  selectedTestTitles,
  handleCheckboxChange,
  selectedLevels,
  handleLevelChange
}) {
  const handleCourseChange = (testTitle) => {
    handleCheckboxChange(year, testTitle);
  };

  const handleLevelChangeForCourse = (event, testTitle) => {
    handleLevelChange(year, testTitle, event.target.value);
  };

  const availableTestTitles = testTitles[year] || [];
  const availableLevels = levels[year] || {};

  return (
    <div className="criteria-section">
      <h3>Criteria for Year {year}</h3>
      <div className="courses">
        {availableTestTitles.map(testTitle => (
          <div key={testTitle} className="course-item">
            <label>
              <input
                type="checkbox"
                checked={selectedTestTitles[year] && selectedTestTitles[year].includes(testTitle)}
                onChange={() => handleCourseChange(testTitle)}
              />
              {testTitle}
            </label>
            {selectedTestTitles[year] && selectedTestTitles[year].includes(testTitle) && (
              <div className="levels">
                <label>
                  Level:
                  <select
                    value={selectedLevels[year] && selectedLevels[year][testTitle] || ""}
                    onChange={(e) => handleLevelChangeForCourse(e, testTitle)}
                  >
                    <option value="">Select Level</option>
                    {(availableLevels[testTitle] || []).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Criteria;
