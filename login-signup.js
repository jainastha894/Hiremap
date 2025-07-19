import express from "express";
import bodyParser from "body-parser";
import pg, { Result } from "pg";
import bcrypt from "bcrypt";
import passport from "./passportConfig.js";
import pkg from "passport-local";
import GoogleStrategy from "passport-google-oauth2"; //import googlestrategy
import { db } from './db.js';

const router = express.Router();
const LocalStrategy = pkg.Strategy;
const saltRounds = 10;

router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            res.next(err);
            console.log("error in logging out: ", err);
        }
        res.redirect("/CLogin");
    })
})

router.get("/form", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("form.ejs");
    }
    else {
        res.redirect("/CLogin");
    }
});

router.post("/CLogin", passport.authenticate("local", {
    successRedirect: "/form",
    failureRedirect: "/CLogin"
}));

router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/auth/google/form",passport.authenticate("google",{
    successRedirect:"/form",
    failureRedirect:"/login"
}))
router.post("/CRegister", async (req, res) => {
    console.log("block: post(CRegister).");
    try {
        const username = req.body.username;
        const password = req.body.password;

        const checkresult = await db.query("select * from users where username=($1)", [username]);
        if (checkresult.rows.length > 0) {
            res.redirect("/CLogin");

        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log("error in bcrypt: ", err);
                }
                else {
                    const insertresult = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) returning *", [username, hash]);
                    console.log("insert result: ", insertresult);
                    const user = insertresult.rows[0];

                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/form");
                    });
                }

            })

        }

    }
    catch (err) {
        console.log("error in post CRegister catch block executing. err: ", err);

    }

})

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/form",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, cb) => {
    try{
        console.log(profile);
        const checkresult=await db.query("select * from users where username= ($1)",[ profile.email]);

        if(checkresult.rows.length==0){
            const newUser=await db.query("insert into users (username, password) values ($1, $2) returning *",[profile.email, "google"]);
            return cb(null, newUser.rows[0]);
        }

        else{
            return cb(null, checkresult.rows[0]);
        }

    }
    catch(err){
        console.log("error in google strategy: ", err);
        return cb(err);
    }
}))

passport.use("local", new LocalStrategy(async (username, password, cb) => {
    const checkresult = await db.query("select * from users where username= ($1)", [username]);
    if (checkresult.rows.length > 0) {
        const user = checkresult.rows[0];
        const storedHashPassword = user.password;
        bcrypt.compare(password, storedHashPassword, (err, valid) => {
            if (valid) {
                //Passed password check
                return cb(null, user);
            } else {
                //Did not pass password check
                return cb(null, false);
            }
        })
    }
    else {
        return cb("user not found");

    }
}))


export default router;
