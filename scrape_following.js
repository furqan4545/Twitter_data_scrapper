// Returns a list of users the specified user ID is following.
// https://developer.twitter.com/en/docs/twitter-api/users/follows/quick-start
const express = require("express");
const cors = require("cors");
const client = require("./db"); 
const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
app.use(cors());
app.use(express.json());  

// const csvWriter = createCsvWriter({
//     path: 'following.csv',
//     header: [
//       {id: 'verified', title: 'Verified'},
//       {id: 'id', title: 'Id'},
//       {id: 'description', title: 'Description'},
//       {id: 'username', title: 'Username'},  
//       {id: 'created_at', title: 'Created_at'},
//       {id: 'name', title: 'Name'},
//       {id: 'followers_count', title: 'Followers_count'},
//       {id: 'following_count', title: 'Following_count'},
//       {id: 'tweet_count', title: 'Tweet_count'},
//       {id: 'listed_count', title: 'Listed_count'},
//       {id: 'location', title: 'Location'}
//     ]
//   });

// this is the ID for @TwitterDev
const userId = 2244994945;
const url = `https://api.twitter.com/2/users/${userId}/following`;
const bearerToken = "AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U";

const getFollowing = async () => {
    let users = [];
    let params = {
        "max_results": 1000,
        "tweet.fields": "attachments,author_id,in_reply_to_user_id,lang,non_public_metrics,referenced_tweets,text",
        "user.fields": "created_at,description,location,public_metrics,verified,username"
    }

    const options = {
        headers: {
            "User-Agent": "v2FollowingJS",
            "Authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving users this user is following...");
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

const getPage = async (params, options, nextToken, url) => {
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

// getFollowing();


const gettFollowing = async (url, bearerToken) => {
    let users = [];
    let params = {
        "max_results": 1000,
        "tweet.fields": "attachments,author_id,in_reply_to_user_id,lang,non_public_metrics,referenced_tweets,text",
        "user.fields": "created_at,description,location,public_metrics,verified,username"
    }

    const options = {
        headers: {
            "User-Agent": "v2FollowingJS",
            "Authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving users this user is following...");
    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken, url);
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

app.get("/followings/:tid", async(req, res) => {
    
    try {

        const {tid} = req.params;
        // const userId = 2244994945;
        const url = `https://api.twitter.com/2/users/${tid}/following`;
        const bearerToken = "AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U";

        var uusers = await gettFollowing(url, bearerToken);

        let data_length = uusers.length;
        for (j = 0; j < data_length; j++) {
            
            // var uid = ;
            var verified =  uusers[j].verified;
            var id = `${uusers[j].id}g`;
            var description = uusers[j].description;
            var username = uusers[j].username;
            var created_at = uusers[j].created_at;
            var name = uusers[j].name;
            var followers_count = uusers[j].public_metrics.followers_count;
            var following_count = uusers[j].public_metrics.following_count;
            var tweet_count = uusers[j].public_metrics.tweet_count;
            var listed_count = uusers[j].public_metrics.listed_count;
            var location = uusers[j].location;

            var ress = await client.query("INSERT INTO following (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location]);
             
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
