const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const {
  Client
} = require('pg');

const database = new Client({
  connectionString: 'postgres://xpwpayxtuouvyw:763226f55f69f2ea1d10916a57022c9d171865aa673abc1a2961b6cdd2ad2d83@ec2-54-235-212-58.compute-1.amazonaws.com:5432/d1kg54svm3k0db',
  ssl: true,
});

database.connect();

function search(req, res, next) {

  //The user's search term
  var searchTerm = req.query.search;

  if (searchTerm == "") {
    database.query('SELECT * FROM Classes WHERE Term = $1 AND Session = $2 AND Department = $3', [req.query.term, req.query.session, req.query.department], (err, result) => {
      if (err) {
        console.log(err);
        next();
      }

      req.result = result;
      // //The results are parsed as JSON into the image column String that points to a file.
      // if (result != undefined) {
      //   req.searchResult = result.rows.map(x => String(x.image));
      //   req.photoID = result.rows.map(x => String(x.id));
      // } else {
      //   req.searchResult = "";
      // }
      // req.searchTerm = searchTerm;
      // req.category = "";
      next();
    });
  } else {
    database.query('SELECT * FROM Classes WHERE Term = $1 AND Session = $2 AND Department = $3 AND CourseNumber = $4', [req.query.term, req.query.session, req.query.department, parseInt(searchTerm)], (err, result) => {
      if (err) {
        console.log(err, "search second query")
        next();
      }

      req.result = result;
      // if (result != undefined) {
      //   req.searchResult = result.rows.map(x => String(x.image));
      //   req.photoID = result.rows.map(x => String(x.id));
      // } else {
      //   req.searchResult = "";
      // }
      // req.searchTerm = searchTerm;
      // req.category = category;
      next();
    });
  }
}

function parseResults(req, res, next) {
	if (req.result != undefined && req.result.rowCount >= 1) {
		console.log("Found results")
		console.log(req.result.rowCount)
		req.classNumber = req.result.rows.map(x => String(x.classnumber));
		req.term = req.result.rows.map(x => String(x.term));
		req.session = req.result.rows.map(x => String(x.session));
		req.department = req.result.rows.map(x => String(x.department));
		req.courseNumber = req.result.rows.map(x => String(x.coursenumber));
		req.courseSection = req.result.rows.map(x => String(x.coursesection));
		req.courseName = req.result.rows.map(x => String(x.coursename));
		req.days = req.result.rows.map(x => String(x.days));
		req.startTime = req.result.rows.map(x => String(x.starttime));
		req.endTime = req.result.rows.map(x => String(x.endtime));
		req.location = req.result.rows.map(x => String(x.location));
		req.professor = req.result.rows.map(x => String(x.professor));
		req.prerequisites = req.result.rows.map(x => String(x.prerequisites));
		req.courseMaterials = req.result.rows.map(x => String(x.coursematerials));
		req.courseDescription = req.result.rows.map(x => String(x.coursedescription));
		req.count = req.result.rowCount;
		next();
	} else {
		console.log("Found no results")
		req.classNumber = "";
		req.term = "";
		req.session = "";
		req.department = "";
		req.courseNumber = "";
		req.courseSection = "";
		req.courseName = "";
		req.days = "";
		req.startTime = "";
		req.endTime = "";
		req.location = "";
		req.professor = "";
		req.prerequisites = "";
		req.courseMaterials = "";
		req.courseDescription = "";
		req.count = 0;
		next();
	}
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', search, parseResults, (req, res) => {
  	res.render('pages/index', {
  		classNumber: req.classNumber,
		term: req.term,
		session: req.session,
		department: req.department,
		courseNumber: req.courseNumber,
		courseSection: req.courseSection,
		courseName: req.courseName,
		days: req.days,
		startTime: req.startTime,
		endTime: req.endTime,
		location: req.location,
		professor: req.professor,
		prerequisites: req.prerequisites,
		courseMaterials: req.courseMaterials,
		courseDescription: req.courseDescription,
		count: req.count,
		result : req.result
  	})
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
