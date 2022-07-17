// finding those accounts who like the given user id.
// this gives you information about the users who are liking my tweets. 

const needle = require("needle");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const express = require("express");
const cors = require("cors");
const client = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); 

// const csvWriter = createCsvWriter({
//   path: 'user_likes.csv',
//   header: [
//     {id: 'name', title: 'Name'},
//     {id: 'location', title: 'Location'},
//     {id: 'id', title: 'Id'},
//     {id: 'username', title: 'Username'},
//     {id: 'verified', title: 'Verified'},
//     {id: 'created_at', title: 'Created_at'},
//     {id: 'followers_count', title: 'Followers_count'},
//     {id: 'following_count', title: 'Following_count'},
//     {id: 'tweet_count', title: 'Tweet_count'},
//     {id: 'listed_count', title: 'Listed_count'},
//     {id: 'description', title: 'Description'}
//   ]
// });

// const id = "1354143047324299264";

// let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

// user who have liked a tweet
// const endpointURL = `https://api.twitter.com/2/tweets/${id}/liking_users`;

async function getRequest(next_token, token, endpointURL) {
  // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id,created_at,source,public_metrics", // Edit optional query parameters here
    "user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
    "pagination_token": next_token
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2LikingUsersJS",
      authorization: `Bearer ${token}`
    },
  });

  if (res.body) {
    return res.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}


// (async () => {
//   try {
//     var n_token = "7140dibdnow9c7btw4544b2105sgr3sr3e9wkidxn1sfq"
//     let stopped = false
//     while(!stopped) {
//     // Make request
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
//             name: response.data[j].name,
//             location: response.data[j].location,
//             id: `${response.data[j].id}g`,
//             username: response.data[j].username,
//             verified: response.data[j].verified,
//             created_at: response.data[j].created_at,
//             followers_count: response.data[j].public_metrics.followers_count,
//             following_count: response.data[j].public_metrics.following_count,
//             tweet_count: response.data[j].public_metrics.tweet_count,
//             listed_count: response.data[j].public_metrics.listed_count,
//             description: response.data[j].description
//           },
//         ];

//         await csvWriter.writeRecords(data);
//         // .then(()=> console.log('The CSV file was written successfully'));
//       }
//       n_token = response.meta.next_token;
//       // kk = response.data[0].public_metrics.followers_count;
      
//       // console.log("dsdd : ", kk)
//       // console.log("ID: ", data_length)
//       // result_count = response.meta.result_count;
//       // if (result_count == 0) {stopped = true}
//       // console.log("This is response: ", response.meta.next_token);
//     }
//   } catch (e) {
//     console.log("error: ", e);
//     process.exit(-1);
//   }
//   process.exit();
// })();


const get_liking_users = async (token, endpointURL) => {
  try {
    var n_token = "7140dibdnow9c7btw4544b2105sgr3sr3e9wkidxn1sfq"
    let stopped = false
    var data = [];

    while(!stopped) {
    // Make request
      const response = await getRequest(n_token, token, endpointURL);
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
    console.log("error: ", e);
    process.exit(-1);
  }
  process.exit();
};

app.get("/liking_users/:tid", async(req, res) => {
    
  try {
      const {tid} = req.params;
      let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
      const url = `https://api.twitter.com/2/tweets/${tid}/liking_users`;

      var uusers = await get_liking_users(token, url);

      let data_length = uusers.length;
      for (j = 0; j < data_length; j++) {
          
          pname = uusers[j].name;
          location = uusers[j].location;
          id = `${uusers[j].id}g`;
          username = uusers[j].username;
          verified = uusers[j].verified;
          created_at = uusers[j].created_at;
          followers_count = uusers[j].public_metrics.followers_count;
          following_count = uusers[j].public_metrics.following_count;
          tweet_count = uusers[j].public_metrics.tweet_count;
          listed_count = uusers[j].public_metrics.listed_count;
          description = uusers[j].description;

          var ress = await client.query("INSERT INTO liking_users (name, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *", [pname, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description]);
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
      console.log(error.message);
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





