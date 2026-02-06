// ✅ ES module imports
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path"; 
import connectPgSimple from "connect-pg-simple";
import db from "./db.js";
import resumeRoute from "./resumeRoute.js";
import loginRouter from "./hr-login.js";
import { readFile } from 'fs/promises';
import passport from "./passportConfig.js";
import session from "express-session";
import loginSignup from "./login-signup.js";
import {generatePresignedUrl, uploadFile, deleteFile , listObjects} from "./s3functions.js";
import compression from "compression";



const data = await readFile('./info.json', 'utf-8');
const info = JSON.parse(data);

const pgSession=connectPgSimple(session);
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.port || 5000;

app.use(compression()); // gzip/brotli compression for responses

// Example: set caching for static assets
app.use(express.static("public", { maxAge: 1000 * 60 * 60 * 24 * 7 })); // 1 week
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  store: new pgSession({
    pool: db,            
    tableName: "session" 
  }),
  secret: "secretlysecret",    
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/hr", loginRouter);

app.use("/", resumeRoute);
app.use("/", loginSignup);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res) => {
  
  res.render("first_page.ejs");
});

const result =await  db.query(`
SELECT 
    hr_id,
    job_name,
    id,
    category,
    work_mode,
    location,
    job_type,
    (CURRENT_DATE - posted_time::date) AS days_ago,
    stipend,
    minimum_qualifications,
    preferred_qualifications,
    about_the_job,
    responsibilities,
    procedure,
    department
FROM jobs;

`);

const jobs = result.rows;
console.log("Jobs : ",jobs);
// make jobs available to all views to prevent "jobs is not defined"
app.locals.jobs = jobs;

function buildJDHTML(job) {

  const days = Number(job.days_ago);
  let postedText;

  if (days === 0) postedText = "Today";
  else if (days === 1) postedText = "1 day ago";
  else postedText = `${days} days ago`;

  return `
    <div class="job-detail">
        <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin:0;">${job.job_name}</h2>

    <button onclick="location.href='/form'"
      style="
        background-color:#0d6efd;
        color:#fff;
        border:none;
        padding:8px 14px;
        border-radius:6px;
        cursor:pointer;
        font-size:14px;
      "
      onmouseover="this.style.backgroundColor='#6c757d'"
      onmouseout="this.style.backgroundColor='#0d6efd'"
    >
      Apply Here
    </button>
  </div>


      ${job.category ? `<p><strong>Category:</strong> ${job.category}</p>` : ""}
      ${job.work_mode ? `<p><strong>Work Mode:</strong> ${job.work_mode}</p>` : ""}
      ${job.location ? `<p><strong>Location:</strong> ${job.location}</p>` : ""}
      ${job.job_type ? `<p><strong>Job Type:</strong> ${job.job_type}</p>` : ""}
      <p><strong>Posted:</strong> ${postedText}</p>
      ${job.stipend ? `<p><strong>Stipend:</strong> ₹${job.stipend}</p>` : ""}

      ${
        job.about_the_job?.trim()
          ? `
            <h3>About the Job</h3>
            <ul>
              ${job.about_the_job
                .split("\n")
                .filter(v => v.trim())
                .map(v => `<li>${v}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }

      ${
        job.minimum_qualifications?.trim()
          ? `
            <h3>Minimum Qualifications</h3>
            <ul>
              ${job.minimum_qualifications
                .split("\n")
                .filter(v => v.trim())
                .map(v => `<li>${v}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }

      ${
        job.preferred_qualifications?.trim()
          ? `
            <h3>Preferred Qualifications</h3>
            <ul>
              ${job.preferred_qualifications
                .split("\n")
                .filter(v => v.trim())
                .map(v => `<li>${v}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }

      ${
        job.responsibilities?.trim()
          ? `
            <h3>Responsibilities</h3>
            <ul>
              ${job.responsibilities
                .split("\n")
                .filter(v => v.trim())
                
                .map(v => `<li>${v}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }

      ${
        job.procedure?.trim()
          ? `
            <h3>Procedure</h3>
            <ul>
              ${job.procedure
                .split("\n")
                .filter(v => v.trim())
                .map(v => `<li>${v}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }
    </div>
  `;
}

app.get("/index", (req, res) => {
  res.render("index.ejs", {showdata: false, data: null, jobs: jobs, departmentSelected:false });
});

app.get("/engineering", async (req, res) => {

 const filteredJobs = jobs.filter(j => j.department.toLowerCase() == "engineering");

  console.log("filteredJobs:", filteredJobs);

  res.render("index.ejs", {
    showdata: false,
    data: null,
    jobs: filteredJobs,
    departmentSelected:true
  });
});

app.get("/marketing", async (req, res) => {

 const filteredJobs = jobs.filter(j => j.department.toLowerCase() == "marketing");

  console.log("filteredJobs:", filteredJobs);

  res.render("index.ejs", {
    showdata: false,
    data: null,
    jobs: filteredJobs,
    departmentSelected:true
  });
});

app.get("/design", async (req, res) => {

 const filteredJobs = jobs.filter(j => j.department.toLowerCase() == "design");

  console.log("filteredJobs:", filteredJobs);

  res.render("index.ejs", {
    showdata: false,
    data: null,
    jobs: filteredJobs,
    departmentSelected:true
  });
});

app.get("/finance", async (req, res) => {

 const filteredJobs = jobs.filter(j => j.department.toLowerCase() == "finance");

  console.log("filteredJobs:", filteredJobs);

  res.render("index.ejs", {
    showdata: false,
    data: null,
    jobs: filteredJobs,
    departmentSelected:true
  });
});


app.get("/jobs/:slug", async (req, res) => {
  const slug = req.params.slug;
  // Adjust query to fetch job by slug or id stored as slug in DB
  const result = await db.query("SELECT * FROM jobs WHERE id = $1 LIMIT 1", [slug]); // change as needed
  const job = result.rows[0];
  if (!job) return res.status(404).render("404.ejs");

  const host = req.protocol + "://" + req.get("host");
  const canonical = host + req.originalUrl;

  res.render("job-detail.ejs", {
    job,
    title: `${job.job_name} - HireMap`,
    description: (job.about_the_job || job.minimum_qualifications || "").slice(0, 160),
    canonical,
    og: {
      title: `${job.job_name} - HireMap`,
      description: (job.about_the_job || "").slice(0, 160),
    }
  });
});

app.get("/Clogin",(req,res)=>{
  res.render("CLogin");
});
app.get("/CRegister", (req,res)=>{
  res.render("CRegister");
});

app.get("/form", (req, res) => {
  res.render("form", {jobs:jobs});
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/login", (req, res) => {
  res.render("hr-login.ejs");
});

app.get("/delete", async(req, res) => {
  const filename=req.query.filename;
  const key=`resume/${filename}`;
  await deleteFile("hiremapresume",key);
});

app.get("/upload",async(req,res)=>{
  if(req.isAuthenticated()){
    console.log("entered into upload route");
    const filename=req.query.filename;
    const key=`resume/${filename}-${Date.now()}`;

    const url=await uploadFile(key);
    console.log("Presigned URL generated:", url);
    res.json({key,url});
  }
  else{
    res.status(401).json({error:"Unauthorized"});
  }
});

app.get("/getresume",async(req,res)=>{
  if(req.isAuthenticated()){
    const key=req.query.key;
    // console.log("key received in getresume route:",key);
    const result = await generatePresignedUrl(key); // returns an array like [{ key, url }]
    const { key: keybygeneratePresignedUrl, url } = result[0];
    // console.log("keybygeneratePresignedUrl,url:",keybygeneratePresignedUrl,url);
    res.json({keybygeneratePresignedUrl,url});
  }
});

app.get("/records", async(req, res) => {
  if (req.isAuthenticated()) {
    const folders=await listObjects();
    console.log(`objects: ${folders.objects}, totalObjects: ${folders.totalObjects}, totalSize: ${folders.totalSize}`);
  }
});

app.get("/sitemap.xml", async (req, res) => {
  const result = await db.query("SELECT id, job_name, posted_time FROM jobs");
  const host = req.protocol + "://" + req.get("host");
  const urls = result.rows.map(r => {
    const loc = `${host}/jobs/${r.id}`; // use slug if available
    const lastmod = new Date(r.posted_time).toISOString();
    return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
