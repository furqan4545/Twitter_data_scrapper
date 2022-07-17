// Get User objects by username, using bearer token authentication
// https://developer.twitter.com/en/docs/twitter-api/users/lookup/quick-start

const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const express = require("express");
const cors = require("cors");
const client = require("./db")

const app = express();
app.use(cors());
app.use(express.json());   


// const csvWriter = createCsvWriter({
//     path: 'users_detail.csv',
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
//       {id: 'listed_count', title: 'Listed_count'}
//     ]
//   });

// const token = "AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U";

// const endpointURL = "https://api.twitter.com/2/users/by?usernames="

async function getRequest(uname, endpointURL, token) {

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
        // usernames: "TwitterDev,TwitterAPI", // Edit usernames to look up
        usernames: `${uname}`,
        "user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
        // "expansions": "pinned_tweet_id"
    }

    // this is the HTTP header that adds bearer token authentication
    const res = await needle('get', endpointURL, params, {
        headers: {
            "User-Agent": "v2UserLookupJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request')
    }
}

// (async () => {

//     try {
//         // Make request
//         const response = await getRequest();
//         console.dir(response, {
//             depth: null
//         });

//         data_length = response.data.length;
//         console.log(data_length)
//         for (j = 0; j < data_length; j++) {
//             const data = [
//               {
//                 verified: response.data[j].verified,
//                 id: `${response.data[j].id}g`,
//                 description: response.data[j].description,
//                 username: response.data[j].username,
//                 created_at: response.data[j].created_at,
//                 name: response.data[j].name,
//                 followers_count: response.data[j].public_metrics.followers_count,
//                 following_count: response.data[j].public_metrics.following_count,
//                 tweet_count: response.data[j].public_metrics.tweet_count,
//                 listed_count: response.data[j].public_metrics.listed_count
//               },
//            ];
//            console.log(data)
//            await csvWriter.writeRecords(data);
//             // .then(()=> console.log('The CSV file was written successfully'));
//         }

//     } catch (e) {
//         console.log(e);
//         process.exit(-1);
//     }
//     process.exit();
// })();

const getUser = async (uname, url, token) => {

    try {
        // Make request
        const response = await getRequest(uname, url, token);
        console.dir(response, {
            depth: null
        });

        return response;    

    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
};

app.get("/get_user/:uname", async(req, res) => {
    
    try {

        const {uname} = req.params;
        const url = "https://api.twitter.com/2/users/by?usernames=";
        const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
        var uusers = await getUser(uname, url, bearerToken);
        
        let data_length = uusers.data.length;

        for (j = 0; j < data_length; j++) {
            
            var verified= uusers.data[j].verified;
            var id= `${uusers.data[j].id}g`;
            var description= uusers.data[j].description;
            var username= uusers.data[j].username;
            var created_at= uusers.data[j].created_at;
            var name= uusers.data[j].name;
            var followers_count= uusers.data[j].public_metrics.followers_count;
            var following_count= uusers.data[j].public_metrics.following_count;
            var tweet_count= uusers.data[j].public_metrics.tweet_count;
            var listed_count= uusers.data[j].public_metrics.listed_count;
            var location= uusers.data[j].location;

            var ress = await client.query("INSERT INTO user_details (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location]);

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


