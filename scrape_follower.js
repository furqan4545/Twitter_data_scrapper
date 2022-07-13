// This will work with Node.js on CommonJS mode (TypeScript or not)
const express = require("express");
const cors = require("cors");
const client = require("./db"); 
const { TwitterApi } = require('twitter-api-v2');
const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
app.use(cors());
app.use(express.json());  

const csvWriter = createCsvWriter({
    path: 'followers.csv',
    header: [
      {id: 'name', title: 'Name'},
      {id: 'location', title: 'Location'},
      {id: 'id', title: 'Id'},
      {id: 'username', title: 'Username'},
      {id: 'verified', title: 'Verified'},
      {id: 'created_at', title: 'Created_at'},
      {id: 'followers_count', title: 'Followers_count'},
      {id: 'following_count', title: 'Following_count'},
      {id: 'tweet_count', title: 'Tweet_count'},
      {id: 'listed_count', title: 'Listed_count'},
      {id: 'description', title: 'Description'}
    ]
  });

// Fetch the followers of a user account, by ID
// https://developer.twitter.com/en/docs/twitter-api/users/follows/quick-start

// this is the ID for @TwitterDev
const userId = 2244994945;
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

const getFollowers = async () => {
    let users = [];
    let params = {
        "max_results": 1000,
        "user.fields": "created_at,description,location,public_metrics,verified",
    }

    const options = {
        headers: {
            "User-Agent": "v2FollowersJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving followers...");
    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                users.push.apply(users, resp.data);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    console.log(users);
    console.log(`Got ${users.length} users.`);

    data_length = users.length;
    for (j = 0; j < data_length; j++) {
        const data = [
            {
            verified: users[j].verified,
            id: `${users[j].id}g`,
            description: users[j].description,
            username: users[j].username,
            created_at: users[j].created_at,
            name: users[j].name,
            followers_count: users[j].public_metrics.followers_count,
            following_count: users[j].public_metrics.following_count,
            tweet_count: users[j].public_metrics.tweet_count,
            listed_count: users[j].public_metrics.listed_count,
            location: users[j].location
            },
        ];
        await csvWriter.writeRecords(data);
    }
}

const getPage = async (params, options, nextToken) => {
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', url, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}

// getFollowers();

const gettFollowers = async () => {
    let users = [];
    let params = {
        "max_results": 1000,
        "user.fields": "created_at,description,location,public_metrics,verified",
    }

    const options = {
        headers: {
            "User-Agent": "v2FollowersJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving followers...");
    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                users.push.apply(users, resp.data);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    console.log(users);
    console.log(`Got ${users.length} users.`);

    return users;
}

app.get("/followers", async(req, res) => {
    
    try {

        // if (!uid || !created_at || !name || !username) {
        //     res.json({
        //         "msg": "Please fill all the fields", 
        //         "status" : 301
        //     });
        // }
        var uusers = await gettFollowers();

        let data_length = uusers.length;
        for (j = 0; j < data_length; j++) {
            
            // var uid = ;
            var verified= uusers[j].verified;
            var id= `${uusers[j].id}g`;
            var description= uusers[j].description;
            var username= uusers[j].username;
            var created_at= uusers[j].created_at;
            var name= uusers[j].name;
            var followers_count= uusers[j].public_metrics.followers_count;
            var following_count= uusers[j].public_metrics.following_count;
            var tweet_count= uusers[j].public_metrics.tweet_count;
            var listed_count= uusers[j].public_metrics.listed_count;
            var location= uusers[j].location;

            var ress = await client.query("INSERT INTO followers (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location]);

        }

        if (ress.rowCount > 0) {
            res.json({
                "msg": "results.rows[0]",
                "status" : 200
            });  // rows[0] mean we dont need all the data in response we just need to read the data that we are inserting in to db just. so we specify row[0]
        }
        else {
            res.json({
                "msg": "No data found",
                "status" : 301
            });
        }
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










