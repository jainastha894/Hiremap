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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
