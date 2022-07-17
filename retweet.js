const needle = require("needle");
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const express = require("express");
const cors = require("cors");
const client = require("./db")

const app = express();
app.use(cors());
app.use(express.json());   


// const csvWriter = createCsvWriter({
//   path: 'retweeted_by.csv',
//   header: [
//     {id: 'verified', title: 'Verified'},
//     {id: 'id', title: 'Id'},
//     {id: 'description', title: 'Description'},
//     {id: 'username', title: 'Username'},  
//     {id: 'created_at', title: 'Created_at'},
//     {id: 'name', title: 'Name'},
//     {id: 'followers_count', title: 'Followers_count'},
//     {id: 'following_count', title: 'Following_count'},
//     {id: 'tweet_count', title: 'Tweet_count'},
//     {id: 'listed_count', title: 'Listed_count'},
//     {id: 'location', title: 'Location'}
//   ]
// });

// const token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
// const id = "1354143047324299264";

// const endpointURL = `https://api.twitter.com/2/tweets/${id}/retweeted_by`;

// async function getRequest(next_token) {
//   // These are the parameters for the API request
//   // by default, only the Tweet ID and text are returned
//   const params = {
//     "tweet.fields": "lang,author_id", // Edit optional query parameters here
//     "user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
//     "pagination_token": next_token
//   };

//   // this is the HTTP header that adds bearer token authentication
//   const res = await needle("get", endpointURL, params, {
//     headers: {
//       "User-Agent": "v2RetweetedByUsersJS",
//       authorization: `Bearer ${token}`
//     },
//   });

//   if (res.body) {
//     return res.body;
//   } else {
//     throw new Error("Unsuccessful request");
//   }
// }

// (async () => {
//   try {
//     var n_token = "7140dibdnow9c7btw4543w41k13jxnpsxeghwd4nu9yy9"
//     let stopped = false
//     while(!stopped) {
//       // Make request
//       const response = await getRequest(n_token);
//       console.dir(response, {
//         depth: null,
//       });
//       result_count = response.meta.result_count;
//       if (result_count == 0) {stopped = true; break}
//       else if (response.status == 503) {stopped = true; break}

//       data_length = response.data.length;

//       for (j = 0; j < data_length; j++) {
//         const data = [
//           {
//             verified: response.data[j].verified,
//             id: `${response.data[j].id}g`,
//             description: response.data[j].description,
//             username: response.data[j].username,
//             created_at: response.data[j].created_at,
//             name: response.data[j].name,
//             followers_count: response.data[j].public_metrics.followers_count,
//             following_count: response.data[j].public_metrics.following_count,
//             tweet_count: response.data[j].public_metrics.tweet_count,
//             listed_count: response.data[j].public_metrics.listed_count,
//             location: response.data[j].location
//           },
//       ];

//       await csvWriter.writeRecords(data);
//         // .then(()=> console.log('The CSV file was written successfully'));
//       }
//       n_token = response.meta.next_token;
//     }
//   } catch (e) {
//     console.log(e);
//     process.exit(-1);
//   }
//   process.exit();
// })();

async function getRequest(next_token, token, endpointURL) {
  // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
    "pagination_token": next_token
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2RetweetedByUsersJS",
      authorization: `Bearer ${token}`
    },
  });

  if (res.body) {
    return res.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}

const getretweets = async (token, endpointURL) => {
  try {

    var n_token = "7140dibdnow9c7btw4543w41k13jxnpsxeghwd4nu9yy9"
    let stopped = false
    var data = [];

    while(!stopped) {
      // Make request
      var response = await getRequest(n_token, token, endpointURL);
      console.dir(response, {
        depth: null,
      });
      result_count = response.meta.result_count;
      if (result_count == 0) {stopped = true; break}
      else if (response.status == 503) {stopped = true; break}

      data_length = response.data.length;
      for (j = 0; j < data_length; j++) {
          data.push(response.data[j])
        }         
      n_token = response.meta.next_token;
    }
    return data;

  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
}


app.get("/retweets/:tid", async(req, res) => {
    
  try {
      const {tid} = req.params;

      const endpointURL = `https://api.twitter.com/2/tweets/${tid}/retweeted_by`;

      const token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
      
      var uusers = await getretweets(token, endpointURL);
      let data_length = uusers.length;
      var ress;

      for (j = 0; j < data_length; j++) {
          
          verified = uusers[j].verified;
          id = `${uusers[j].id}g`;
          description = uusers[j].description;
          username = uusers[j].username;
          created_at = uusers[j].created_at;
          pname = uusers[j].name;
          followers_count = uusers[j].public_metrics.followers_count;
          following_count = uusers[j].public_metrics.following_count;
          tweet_count = uusers[j].public_metrics.tweet_count;
          listed_count = uusers[j].public_metrics.listed_count;
          location = uusers[j].location;

          ress = await client.query("INSERT INTO retweeted_by (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location) VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *", [verified, id, description, username, created_at, pname, followers_count, following_count, tweet_count, listed_count, location]);

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
      console.log(error);
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




