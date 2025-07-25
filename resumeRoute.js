// routes/resumeRoute.js
import express from 'express';
import db from './db.js'; // Make sure the path is correct

import upload from "./multerConfig.js"; // import multer config for file upload

const router = express.Router();

function toInitialCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

router.post('/submit-resume', upload.single('resume'),(req, res) => {
  let { name, email, role, phone, address } = req.body;
const resume = req.file.filename;
console.log("req.body: ", req.body);
console.log("req.body.id",req.body.id);
console.log("req.user?.id", req.user?.id);
const userId= req.user?.id;

name = toInitialCase(name);
email = email.toLowerCase(); // keep email in lowercase (standard)
role = role.trim();// keep as is, just clean spaces
phone = phone.trim(); // keep as is, just clean spaces
address = address.trim();

const query = `
  INSERT INTO applicants (name, email, role, phone, address, resume, submitted_at,user_id)
  VALUES ($1, $2, $3, $4, $5, $6, NOW(),($7))
`;

db.query(query, [name, email, role, phone, address, resume,userId]);

    res.send('Resume submitted successfully!');
  });


export default router;
