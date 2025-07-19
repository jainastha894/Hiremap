import passport from "passport";
import { db } from "./db.js";

passport.serializeUser((user, cb) => {
    cb(null, user);
    console.log("user.id in serialize user: ",user.id);
});

passport.deserializeUser(async (user, cb) => {
    if(user.id=="hr"){
        console.log("i am in first block");
        return cb(null,user);
    }
    else{
    try {
        console.log("i am in second block");
        const result = await db.query("SELECT * FROM users WHERE id = $1", [user.id]);
        cb(null, result.rows[0]);
    } catch (err) {
        cb(err);
    }
    }

});
export default passport;