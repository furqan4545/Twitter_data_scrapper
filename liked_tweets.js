// this code tells that what are the tweets liked by user. so it basically gives you tweet ids liked by specific user. 

const needle = require("needle");
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const express = require("express");
const cors = require("cors");
const client = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); 


// const csvWriter = createCsvWriter({
//   path: 'tweets_liked.csv',
//   header: [
//     {id: 'lang', title: 'Lang'},
//     {id: 'place_id', title: 'Place_id'},
//     {id: 'id', title: 'Id'},
//     {id: 'source', title: 'Source'},
//     {id: 'text', title: 'Text'},
//     {id: 'created_at', title: 'Created_at'},
//     {id: 'author_id', title: 'Author_id'},
//     {id: 'retweet_count', title: 'Retweet_count'},
//     {id: 'reply_count', title: 'Reply_count'},
//     {id: 'like_count', title: 'Like_count'},
//     {id: 'quote_count', title: 'Quote_count'}
//   ]
// });

// let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
// const token = '7140dibdnow9c7btw423wwmj7yaip007h9hpioql8wgfl';
// const id = "2244994945";


// tweets liked by a user
// const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;

async function getRequest(next_token, token, endpointURL) {
  // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id,created_at,source,public_metrics,geo", // Edit optional query parameters here
    "user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
    "pagination_token": next_token
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2LikedTweetsJS",
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
//     var n_token = "7140dibdnow9c7btw423wwn50dihtrzhathqw66brwqb8"
//     let stopped = false
//     while(!stopped) {
//       //// Make request
//       const response = await getRequest(n_token);
//       console.dir(response, {
//         depth: null,
//       });
//       result_count = response.meta.result_count;
//       if (result_count == 0) {stopped = true; break}
//       else if (response.status == 503) {stopped = true; break}
  
//       data_length = response.data.length;

//       for (j = 0; j < data_length; j++) {
//         loca = response.data[j].geo;
//         if (!loca){
//           loca = ""
//         }
//         else {
//           loca = response.data[j].geo.place_id
//         }

//         const data = [
//           {
//             lang: response.data[j].lang,
//             place_id: loca,
//             id: `${response.data[j].id}g`,
//             source: response.data[j].source,
//             text: response.data[j].text,
//             created_at: response.data[j].created_at,
//             author_id: response.data[j].author_id,
//             retweet_count: response.data[j].public_metrics.retweet_count,
//             reply_count: response.data[j].public_metrics.reply_count,
//             like_count: response.data[j].public_metrics.like_count,
//             quote_count: response.data[j].public_metrics.quote_count
//           },
//         ];

//       await csvWriter.writeRecords(data);
//       }
//       n_token = response.meta.next_token;

//     }

//   } catch (e) {
//     console.log(e);
//     process.exit(-1);
//   }
//   process.exit();
// })();


const get_liking_tweets = async (token, endpointURL) => {
  try {
    var n_token = "7140dibdnow9c7btw423wwn50dihtrzhathqw66brwqb8"
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

app.get("/liking_tweets/:tid", async(req, res) => {
    
  try {
      const {tid} = req.params;
      let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
      const url = `https://api.twitter.com/2/users/${tid}/liked_tweets`;

      var uusers = await get_liking_tweets(token, url);

      let data_length = uusers.length;

      for (j = 0; j < data_length; j++) {

          loca = uusers[j].geo;
          if (!loca){
            loca = ""
          }
          else {
            loca = uusers[j].geo.place_id
          }
          
          lang = uusers[j].lang;
          place_id = loca;
          id = `${uusers[j].id}g`;
          source = uusers[j].source;
          text = uusers[j].text;
          created_at = uusers[j].created_at;
          author_id = uusers[j].author_id;
          retweet_count = uusers[j].public_metrics.retweet_count;
          reply_count = uusers[j].public_metrics.reply_count;
          like_count = uusers[j].public_metrics.like_count;
          quote_count = uusers[j].public_metrics.quote_count;

          var ress = await client.query("INSERT INTO liked_tweets (lang, place_id, id, source, text, created_at, author_id, retweet_count, reply_count, like_count, quote_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *", [lang, place_id, id, source, text, created_at, author_id, retweet_count, reply_count, like_count, quote_count]);
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



 
