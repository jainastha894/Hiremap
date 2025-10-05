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



const data = await readFile('./info.json', 'utf-8');
const info = JSON.parse(data);

const pgSession=connectPgSimple(session);
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.port || 5000;

app.use(express.static("public"));
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
app.get("/index", (req, res) => {
  res.render("index.ejs", { data: null });
});

app.get("/SoftwareEngineer", (req, res) => {
  res.render("index.ejs", { data: info.SoftwareEngineer.htmlContent });
});
app.get("/DataAnalyst", (req, res) => {
  res.render("index.ejs", { data: info.DataAnalyst.htmlContent });
});
app.get("/CloudEngineer", (req, res) => {
  res.render("index.ejs", { data: info.CloudEngineer.htmlContent });
});
app.get("/CyberSecurity", (req, res) => {
  res.render("index.ejs", { data: info.cyberSecurity.htmlContent });
});
app.get("/ProductManager", (req, res) => {
  res.render("index.ejs", { data: info.ProductManager.htmlContent });
});
app.get("/UX/UIDesigner", (req, res) => {
  res.render("index.ejs", { data: info.uxUiDesigner.htmlContent });
});
app.get("/TechnicalSupportEngineer", (req, res) => {
  res.render("index.ejs", { data: info.TechnicalSupportEngineer.htmlContent });
});
app.get("/DevOpsEngineer", (req, res) => {
  res.render("index.ejs", { data: info.DevOpsEngineer.htmlContent });
});
app.get("/AI/MLEngineer", (req, res) => {
  res.render("index.ejs", { data: info.aiMlEngineer.htmlContent });
});
app.get("/BusinessAnalyst", (req, res) => {
  res.render("index.ejs", { data: info.BusinessAnalyst.htmlContent });
});

app.get("/Clogin",(req,res)=>{
  res.render("CLogin");
});
app.get("/CRegister", (req,res)=>{
  res.render("CRegister");
});

app.get("/form", (req, res) => {
  res.render("form");
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


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
