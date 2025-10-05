// routes/resumeRoute.js
import express from 'express';
import db from './db.js'; // Make sure the path is correct

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function toInitialCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

router.post('/submit-resume',(req, res) => {
  console.log("req.body: ", req.body);
  let { name, email, phone, address, role, resume } = req.body;

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
