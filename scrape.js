const express = require("express");
const cors = require("cors");
const client = require("./db"); 

const app = express();
app.use(cors());
app.use(express.json());   


app.post("/senddata", async(req, res) => {
    
    try {
        const {uname} = req.body;
        // const {password} = req.body;

        if (!uname) {
            res.json({
                "msg": "Please fill all the fields", 
                "status" : 301
            });
        }

        client.query("INSERT INTO users (uname) VALUES ($1) RETURNING *", [uname],
            (err, results) => {
                if (err) {
                    throw err;
                } else{
                    res.json({
                        "msg": results.rows[0],
                        "status" : 200
                    });  // rows[0] mean we dont need all the data in response we just need to read the data that we are inserting in to db just. so we specify row[0]
                }
            });   



    } catch (error) {
        console.log("Error occured");
    }
})

app.post("/followings", async(req, res) => {
    
    try {
        const {userid} = req.body;
        const {created_at} = req.body;
        const {name} = req.body;
        const {username} = req.body;
        const {verified} = req.body;
        const {location} = req.body;
        const {followers_count} = req.body;
        const {following_count} = req.body;
        const {tweet_count} = req.body;
        const {listed_count} = req.body;
        

        if (!userid || !created_at || !name || !username) {
            res.json({
                "msg": "Please fill all the fields", 
                "status" : 301
            });
        }

        client.query("INSERT INTO following (userid, created_at, name, username, verified, location, followers_count, following_count, tweet_count, listed_count) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10) RETURNING *", [userid, created_at, name, username, verified, location, followers_count, following_count, tweet_count, listed_count],
            (err, results) => {
                if (err) {
                    throw err;
                } else{
                    res.json({
                        "msg": results.rows[0],
                        "status" : 200
                    });  // rows[0] mean we dont need all the data in response we just need to read the data that we are inserting in to db just. so we specify row[0]
                }
            });   

    } catch (error) {
        console.log("Error occured");
    }
})

app.post("/follower", async(req, res) => {
    
    try {
        const {userid} = req.body;
        const {created_at} = req.body;
        const {name} = req.body;
        const {username} = req.body;
        const {verified} = req.body;
        const {location} = req.body;
        const {followers_count} = req.body;
        const {following_count} = req.body;
        const {tweet_count} = req.body;
        const {listed_count} = req.body;
        

        if (!userid || !created_at || !name || !username) {
            res.json({
                "msg": "Please fill all the fields", 
                "status" : 301
            });
        }

        client.query("INSERT INTO following (userid, created_at, name, username, verified, location, followers_count, following_count, tweet_count, listed_count) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10) RETURNING *", [userid, created_at, name, username, verified, location, followers_count, following_count, tweet_count, listed_count],
            (err, results) => {
                if (err) {
                    throw err;
                } else{
                    res.json({
                        "msg": results.rows[0],
                        "status" : 200
                    });  // rows[0] mean we dont need all the data in response we just need to read the data that we are inserting in to db just. so we specify row[0]
                }
            });    

    } catch (error) {
        console.log("Error occured");
    }
})


// database connection here. //
async function dbStart() {
    try { 
        await client.connect();
        console.log("DB connected successfully.");
        // await client.query("");

    }
    catch (e) {
        console.error(`The error has occured: ${e}`)
    }
}

app.listen(5000, () => {
    console.log("Server has started on port 5000");
    dbStart();
})










