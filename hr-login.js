import express from 'express';
import db from './db.js'; // import your DB connection
import fs from 'fs';
import path from 'path';
import passport from "./passportConfig.js";
import pkg from "passport-local";
const LocalStrategy = pkg.Strategy;

const router = express.Router();

const HR_EMAIL = 'login@gmail.com';
const HR_PASSWORD = '123';


// Render the login page at /hr/login
router.get('/hr/login', (req, res) => {
  res.render('hr-login.ejs', { error: null });
});

router.get("/applicants", async (req, res) => {
  console.log("entered into applicants block");
  if (req.isAuthenticated()) {
    console.log("req.isauthenticated() block");
    const sql = 'SELECT * FROM applicants order by submitted_at DESC';
    const results = await db.query(sql);

    res.render("dashboard.ejs", { applicants: results.rows });
  }
  else {
    res.render("hr-login.ejs");
  }
})

router.post('/hr/submit', passport.authenticate("hr-local", {
  successRedirect: "/applicants",
  failureRedirect: "/hr/login"
}));

passport.use("hr-local", new LocalStrategy(async function verify(username, password, cb) {
  try {

    if (username === HR_EMAIL && password === HR_PASSWORD) {
      console.log("{username,password} here: ",{username,password});
      const id="hr";
      const user ={username,password,id};

      return cb(null, user);
    }
    else {
      console.log("wrong password entered by hr user");
      return cb(null, false);
    }
  }
  catch (err) {
    console.log("error in local strategy: ", err);

  }
}))
// DELETE Route: Delete an applicant and their resume
router.delete('/delete-applicant/:id', async (req, res) => {
  const applicantId = req.params.id;

  // Step 1: Fetch resume filename from DB
  try {
    const fetchQuery = 'SELECT resume FROM applicants WHERE id = $1';
    const results = await db.query(fetchQuery);


    const resumeFilename = results.rows[0].resume;
    const filePath = path.join(process.cwd(), 'uploads', resumeFilename);


    // Step 2: Delete file from uploads folder (if exists)
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        console.error('Error deleting file:', unlinkErr);
      }
    });
  }
  catch (err) {
    console.log("error in fetching resume filename from db", err);
  }
  try {
    // Step 3: Delete applicant from DB
    const deleteQuery = 'DELETE FROM applicants WHERE id = $1';
    await db.query(deleteQuery, [applicantId]);

    res.json({ message: 'Applicant and resume deleted successfully' });



  }
  catch (err) {
    console.log("error in deleting record: ", err);
  }

});

// GET Route: Filter applicants based on role and date
router.get('/filter-applicants', async (req, res) => {
  const { role, date } = req.query;
  let sql = 'SELECT * FROM applicants WHERE 1=1';

  if (role) {
    sql += ' AND role = $1';
  }
  if (date) {
    sql += ' AND submitted_at >= $1';
  }

  const queryParams = [];
  if (role) queryParams.push(role);
  if (date) queryParams.push(date);

  const results = await db.query(sql, queryParams);
  res.json({ applicants: results.rows });
});



export default router;
