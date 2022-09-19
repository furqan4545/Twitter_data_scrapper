

var tokens = {
    consumer_key: 'giqxYOWnXosvhkeyzbE4V9ox8',
    consumer_secret: 'hRa3cTkAvr0BfjIcLiJcwvFrF1HeFDPG5dabMyfzcdIaTmvaA3',
    access_token: '1497087080937451521-i8ZHCk5U4YYp2ejPW6gD5te0mG3tUz',
    access_token_secret: 'FceNCn84QVvVWcSNLEeemItrK9UYAcUKE29MolJbfIX6k'
};

const express = require("express");
const cors = require("cors");
const client = require("./db"); 
const { TwitterApi } = require('twitter-api-v2');
const needle = require('needle');
var getTwitterFollowers = require('get-twitter-followers');
const app = express();
app.use(cors());
app.use(express.json());  

const gettFollowers = async (url,bearerToken) => {
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

// Get Followers
app.get("/followers/:tid", async(req, res) => {
    
    try {
        const {tid} = req.params;
        const url = `https://api.twitter.com/2/users/${tid}/followers`;
        const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

        var uusers = await gettFollowers(url, bearerToken);

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

            var ress = await client.query("INSERT INTO followers (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, p_id) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11,$12) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, tid]);

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


// Get Followings 
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

            var ress = await client.query("INSERT INTO following (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, p_id) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11,$12) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, tid]);
             
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

// Retweets
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
  
            ress = await client.query("INSERT INTO retweeted_by (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, p_id) VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *", [verified, id, description, username, created_at, pname, followers_count, following_count, tweet_count, listed_count, location, tid]);
  
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

  
const gettQuoteTweets = async (url, bearerToken) => {
    let quoteTweets = [];
    let params = {
        "max_results": 100,
        "tweet.fields": "created_at,public_metrics",
        "user.fields": "username"
    }

    const options = {
        headers: {
            "User-Agent": "v2QuoteTweetsJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving quote Tweets...");
    while (hasNextPage) {
        let resp = await getPage_quo(params, options, nextToken, url);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                quoteTweets.push.apply(quoteTweets, resp.data);
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

    console.dir(quoteTweets, {
        depth: null
    });

    console.log(`Got ${quoteTweets.length} quote Tweets for Tweet ID ${tweetId}!`);

    return quoteTweets;

}

const getPage_quo = async (params, options, nextToken, url) => {
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

app.get("/quote_tweets/:tid", async(req, res) => {
    
    try {
        const {tid} = req.params;

        const url = `https://api.twitter.com/2/tweets/${tid}/quote_tweets`;
        const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

        var uusers = await gettQuoteTweets(url, bearerToken);

        let data_length = uusers.length;
        for (j = 0; j < data_length; j++) {
            
            created_at = uusers[j].created_at;
            text = uusers[j].text;
            id = `${uusers[j].id}g`;
            retweet_count = uusers[j].public_metrics.retweet_count;
            reply_count = uusers[j].public_metrics.reply_count;
            like_count = uusers[j].public_metrics.like_count;
            quote_count = uusers[j].public_metrics.quote_count;

            var ress = await client.query("INSERT INTO quote_tweets (created_at, text, id, retweet_count, reply_count, like_count, quote_count, p_id) VALUES ($1, $2,$3,$4,$5,$6,$7,$8) RETURNING *", [created_at, text, id, retweet_count, reply_count, like_count, quote_count, tid]);

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


const get_liking_users = async (token, endpointURL) => {
    try {
      var n_token = "7140dibdnow9c7btw4544b2105sgr3sr3e9wkidxn1sfq"
      let stopped = false
      var data = [];
  
      while(!stopped) {
      // Make request
        const response = await getRequest_u(n_token, token, endpointURL);
        console.dir(response, {
          depth: null,
        });
        console.log(response);
        if (response.errors != null) {stopped = true; break}

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

  async function getRequest_u(next_token, token, endpointURL) {
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

  app.get("/liking_users/:tid", async(req, res) => {
    
    try {
        const {tid} = req.params;
        let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
        const url = `https://api.twitter.com/2/tweets/${tid}/liking_users`;
  
        var uusers = await get_liking_users(token, url);
        if (uusers.length == 0) {
            res.json({
                "msg": "No data found",
                "status" : 301
            });
        }
        else{
  
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
  
            var ress = await client.query("INSERT INTO liking_users (name, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description, p_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *", [pname, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description, tid]);
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
    }
    } catch (error) {
        console.log(error.message);
        console.log("Error occured");
    }
  })

  const get_liking_tweets = async (token, endpointURL) => {
    try {
      var n_token = "7140dibdnow9c7btw423wwn50dihtrzhathqw66brwqb8"
      let stopped = false
      var data = [];
  
      while(!stopped) {
      // Make request
        const response = await getRequest_t(n_token, token, endpointURL);
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

  async function getRequest_t(next_token, token, endpointURL) {
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
  
            var ress = await client.query("INSERT INTO liked_tweets (lang, place_id, id, source, text, created_at, author_id, retweet_count, reply_count, like_count, quote_count, p_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, $12) RETURNING *", [lang, place_id, id, source, text, created_at, author_id, retweet_count, reply_count, like_count, quote_count, tid]);
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

const getUser = async (uname, url, token) => {

    try {
        // Make request
        const response = await getRequest_uu(uname, url, token);
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

async function getRequest_uu(uname, endpointURL, token) {

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

            var ress = await client.query("INSERT INTO user_details (verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, p_id) VALUES ($1, $2,$3,$4,$5,$6,$7, $8,$9,$10,$11, $12) RETURNING *", [verified, id, description, username, created_at, name, followers_count, following_count, tweet_count, listed_count, location, uname]);

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


const gettUserTweets = async (url, bearerToken) => {
    let userTweets = [];

    // we request the author_id expansion so that we can print out the user name later
    let params = {
        "max_results": 100,
        "tweet.fields": "author_id,created_at,lang,public_metrics,source,text",
        "expansions": "author_id"
    }

    const options = {
        headers: {
            "User-Agent": "v2UserTweetsJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    let userName;
    console.log("Retrieving Tweets...");

    while (hasNextPage) {
        let resp = await getttPage(params, options, nextToken, url);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            userName = resp.includes.users[0].username;
            if (resp.data) {
                userTweets.push.apply(userTweets, resp.data);
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

    console.dir(userTweets, {
        depth: null
    });
    console.log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${userId})!`);

    return userTweets;
}

const getttPage = async (params, options, nextToken, url) => {
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

app.get("/get_tweets/:tid", async(req, res) => {
    
    try {
        const {tid} = req.params;
        const url = `https://api.twitter.com/2/users/${tid}/tweets`;
        const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

        var uusers = await gettUserTweets(url, bearerToken);

        let data_length = uusers.length;
        for (j = 0; j < data_length; j++) {
            
            created_at = uusers[j].created_at;
            text = uusers[j].text;
            author_id = uusers[j].author_id;
            id = `${uusers[j].id}g`;
            source = uusers[j].source;
            lang = uusers[j].lang;
            retweet_count = uusers[j].public_metrics.retweet_count;
            reply_count = uusers[j].public_metrics.reply_count;
            like_count = uusers[j].public_metrics.like_count;
            quote_count = uusers[j].public_metrics.quote_count;

            var ress = await client.query("INSERT INTO get_tweets (created_at, text, author_id, id, source, lang, retweet_count, reply_count, like_count, quote_count, p_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11) RETURNING *", [created_at, text, author_id, id, source, lang, retweet_count, reply_count, like_count, quote_count, tid]);

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


app.get("/followers/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM followers WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/followings/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM following WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/quote_tweets/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM quote_tweets WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/retweets/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM retweeted_by WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/get_tweets/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM get_tweets WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/liking_users/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM liking_users WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/liking_tweets/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM liked_tweets WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

})

app.get("/get_user/user/:tid", async(req, res) => {
    const {tid} = req.params;

    // cosnt query = await client.query("SELECT * FROM sensor_data2 INNER JOIN users on sensor_data2.uname=users.name");
    const query = await client.query("SELECT * FROM user_details WHERE p_id=$1", [tid]);
    // query = await client.query("SELECT * FROM sensor_data INNER JOIN users on sensor_data.uname=users.uname WHERE sensor_data.uname=$1", [uname]);

    res.json(query.rows);

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

const { spawn } = require('child_process');



app.post("/deleteBadFollower", async(req, res) => {
    const { userID, followerID } = req.body;
    console.log(userID, followerID);
    const deleteBadUserTweets = async(userID, followerID) => {
        try {
            await client.query(`DELETE FROM "myFollowersTweets" WHERE "tweet_user)id" = $1`, [followerID]); // sends queries
            return true;
        } catch (error) {
            console.error(error.stack);
            return false;
        } finally {
            //await client.end(); // closes connection
        }
    };
    deleteBadUserTweets(userID, followerID).then((result) => {
        if (result) {
            console.log('User deleted');
        }
        //return res.json({ msg: "User is going to be deleted from your followers list" });
    });


    const deleteUserFollowersTable = async(userID, followerID) => {
        try {
            await client.query(`DELETE FROM "userFollowertable" WHERE followerid = $1`, [followerID]); // sends queries
            return true;
        } catch (error) {
            console.error(error.stack);
            return false;
        } finally {
            //await client.end(); // closes connection
        }
    };
    deleteUserFollowersTable(userID, followerID).then((result) => {
        if (result) {
            console.log('User deleted');
        }
        //return res.json({ msg: "User is going to be deleted from your followers list" });
    });

    const deleteBadUserWords = async(userID, followerID) => {
        try {
            await client.query(`DELETE FROM "tableforBadWords" WHERE tweet_user_id = $1`, [followerID]); // sends queries
            return true;
        } catch (error) {
            console.error(error.stack);
            return false;
        } finally {
            //await client.end(); // closes connection
        }
    };
    deleteBadUserWords(userID, followerID).then((result) => {
        if (result) {
            console.log('User deleted');
        }
        return res.json({ msg: "User is going to be deleted from your followers list" });
    });


});
app.post("/CyberbullyFollowersRanking", async(req, resss) => {
    const { username } = req.body;
     console.log(username);
    const getFile = fileName => {
        return new Promise((resolve, reject) => {
            var out = [];
            const pyProg = spawn('python3', ['WhoIsBadFollower.py', username]);
            pyProg.stdout.on('data', function(data) {
                console.log(data.toString());
                out.push(data.toString());
            });
            pyProg.stderr.on('data', (data) => {
                console.error('err: ', data.toString());
           });
            setTimeout(resolve, 70000, out);
        });
    };

    const Data_fromServer = async(dataRow) => {
        var badWordUsage = {
            'nodes': [
                { 'id': 'Bacha', 'label': 'circle' },
            ],
            'edges': [{
                'user': '',
                'followerUsername': '',
                'fuck': 0,
                'bitch': 0,
                'shit': 0,
                'asshole': 0,
                'motherfucker': 0,
               'pussy': 5,
                'bastard': 6,
                'stupid': 7,
                'bullshit': 8,
                'idiot': 9,
                'total_badWords': 0,
                'location': '',
                'latitude': '',
                'longitude': '',
                'tweet_usr_id': '',
                'profile_image_url_https': ''
            }]
        }
        try {
            for (let row of dataRow) {
                badWordUsage['edges'].push({
                    'user': row.user,
                    'followerUsername': row.followerUsername,
                    'fuck': Number(row.fuck),
                    'bitch': Number(row.bitch),
                    'shit': Number(row.shit),
                    'asshole': Number(row.asshole),
                    'motherfucker': Number(row.motherfucker),
                    'pussy': Number(row.pussy),
                    'bastard': Number(row.bastard),
                    'stupid': Number(row.stupid),
                    'bullshit': Number(row.bullshit),
                    'idiot': Number(row.idiot),
                    'total_badWords': Number(row.fuck) + Number(row.bitch) + Number(row.shit) + Number(row.asshole) + Number(row.motherfucker),
                    'location': row.location,
                    'latitude': row.latitude,
                    'longitude': row.longitude,
                    'tweet_usr_id': row.tweet_user_id,
                    'profile_image_url_https': row.profile_image_url_https,
                    'tweet_user_followers_count': row.tweet_user_followers_count,
                    'tweet_user_following_count': row.tweet_user_following_count
                }, );
            }
            return badWordUsage;
        } catch (error) {
            console.log("Query Error", error);
            return false;
        } finally {}
    };

    const UserCyberBullyReport = async(username) => {
        const row = await client.query(`SELECT * FROM "tableforBadWords" WHERE "user" = $1`, [username]);
        // console.log(row.rows.length);
        // console.log(row);
        if (row.rows.length > 0) {
               return 0;
        } else {
            return -1;
        }


    };

    UserCyberBullyReport(username).then(result => {
        if (result === 0) {
            console.log('User exist...');
            client.query(`SELECT * from "tableforBadWords" WHERE "user" = $1`, [username], (err, res) => {
                if (err) {
                    console.error(err);
                    return;
                }
                Data_fromServer(res.rows).then(resultttt => {
                    if (resultttt) {
                        console.log('data crowl properply');
                        resultttt['nodes'].shift();
                        resultttt['edges'].shift();
                        //console.log(resultttt);

                        return resss.json({ msg: resultttt });
                    } else {
                        console.log('data crowl not properply');
                    }
                });
            });

                   
            // badWordUsage['edges'].shift();

        } else {
            console.log("This email is New ");
            getFile()
                .then(data => {
			console.log(username+ ' check 2');
                    client.query(`SELECT * from "tableforBadWords" WHERE "user" = $1`, [username],(err, res) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        Data_fromServer(res.rows).then(resultttt => {
                            if (resultttt) {
                                console.log('data crowl properply');
                                resultttt['nodes'].shift();
                                resultttt['edges'].shift();
                                //console.log(badWordUsage);

                                return resss.json({ msg: resultttt });
                            } else {
                                console.log('data crowl not properply');
                            }
                        });
                    });
                    // return resss.json({ msg: "Your report is going to be ready now" });
                })
                .catch(err => console.error(err));

        }
    });
});


const TwitterAPis = async(username) => {
    try {
        var SizeofFollowers;
        await getTwitterFollowers(tokens, username).then(followers => {
            SizeofFollowers = followers;
        });
        return SizeofFollowers;
    } catch (error) {
        console.error(error.stack);
        return false;
    } finally {
        // await client.end(); // closes connection
    }
};

app.post("/twitterlogUserInfo", async(req, res) => {
    const { userID, username, displayName, photoURL, friends_count, followers_count, time_zone, favourites_count, verified } = req.body;
	console.log('User is trying to login');
    const CountFollowers = async() => {
        try {
            const { rows } = await client.query(`Select * from "userFollowertable"`);
            var totalFollowers = 0;
            for (var i = 0; i < rows.length; i++) {
                totalFollowers = totalFollowers + 1
            }
            return totalFollowers;
        } catch (error) {
            console.error(error.stack);
            return 0;
        } finally {
            // await client.end(); // closes connection
        }
    };

    const InsertFollowers = async(followers, userID, getthis) => {
        try {
            console.log("Store all infromation of followers in database")
            for (var i = 0; i < followers.length; i++) {
                //console.log(followers[i]['screen_name']);
                await client.query(
                    `INSERT INTO "userFollowertable"("userTwitterid", "Twitterusername","followername","followerid",
                    "followers_count","friends_count","retweeted_count","created_at","favourites_count",
                    "statuses_count","verified_account","profile_image_url_https") 
                    VALUES('${userID}', '${getthis}','${followers[i]['screen_name']}','${followers[i]['id_str']}',
                    '${followers[i]['followers_count']}','${followers[i]['friends_count']}',
                    '${followers[i]['status']['retweet_count']}','${followers[i]['created_at']}',
                    '${followers[i]['favourites_count']}','${followers[i]['statuses_count']}',
                    '${followers[i]['verified']}','${followers[i]['profile_image_url_https']}')`); // sends queries
            }
            return true;
        } catch (error) {
            console.error(error.stack);
            return false;
        } finally {
            // await client.end(); // closes connection
        }
    };


    const insertUser = async(userID, username, displayName, photoURL, friends_count, followers_count, time_zone, favourites_count, verified) => {
        try {
            await client.query(
                `INSERT INTO twitterregistered("Twitterid", "Twitterusername","displayName","photoURL",friends_count,followers_count,time_zone,favourites_count,verified) VALUES('${userID}', '${username}','${displayName}','${photoURL}','${Number(friends_count)}','${Number(followers_count)}','${time_zone}','${Number(favourites_count)}','${verified}')`); // sends queries
            return true;
        } catch (error) {
            //console.error(error);
            return false;
        } finally {
            // await client.end(); // closes connection
        }
    };
    insertUser(userID, username, displayName, photoURL, friends_count, followers_count, time_zone, favourites_count, verified).then(result => {
        if (result) {
            console.log('User singup first time crawl followers...');
            TwitterAPis(username).then(UserFollowerss => {
                console.log('All Followers List Return ');
                // console.log(UserFollowerss);
                InsertFollowers(UserFollowerss, userID, username).then(finish => {
                    if (finish) {
                        CountFollowers().then(totalFollowers => {
                            console.log("User have registred and followers stored in database show welcome page on smartphone");
                            return res.json({ msg: "Welcome to Twitter Ranking", totalFollowr: totalFollowers });
                        })
                    }
                })

            });
        } else {
            CountFollowers().then(totalFollowers => {
                console.log("User have already account redirect to welcome page on smartphone");
                return res.json({ msg: "Welcome to Twitter Ranking", totalFollowr: totalFollowers });
            })
        }
    });


});



const get_liking_users_my_tweets = async(token, endpointURL) => {
console.log('get_liking_users_my_tweets');    
try {
        var n_token = "7140dibdnow9c7btw4544b2105sgr3sr3e9wkidxn1sfq"
        let stopped = false
        var data = [];

        while (!stopped) {
            // Make request
            const response = await getRequest_user_info(n_token, token, endpointURL);
            //console.dir(response, {
             //   depth: null,
            //});
       //     console.log(response);
            if (response.errors != null) { stopped = true; break }

            result_count = response.meta.result_count;
            if (result_count == 0) { stopped = true; break } else if (response.status == 503) { stopped = true; break }

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

async function getRequest_user_info(next_token, token, endpointURL) {
    // These are the parameters for the API request
    // by default, only the Tweet ID and text are returned
//console.log('get Request for tweets');    
const params = {
        //"tweet.fields": "lang,author_id,created_at,source,public_metrics", // Edit optional query parameters here
	"tweet.fields": "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld",
        //"user.fields": "created_at,description,location,public_metrics,verified", // Edit optional query parameters here
	"user.fields" : "created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld",
"pagination_token": next_token
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await needle("get", endpointURL, params, {
        headers: {
            "User-Agent": "v2LikingUsersJS",
            authorization: `Bearer ${token}`
        },
    });
	console.log(res.body);
    if (res.body) {
        return res.body;
    } else {
        throw new Error("Unsuccessful request");
    }
}



async function RankingByLikesServer(personID) {
console.log('Like wala function called');
var UserInfo1 = [{
    "id_str": 1255,
    "screen_name": "WasaySardar",
    "location": "Attock, Punjab, Pakistan",
    "followers_count": 10,
    "friends_count": 25,
    "created_at": "Wed May 27 12:41:17 +0000 2020",
    "favourites_count": 44,
    "statuses_count": 77,
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/1434143486320812033/muR7wlEk_normal.jpg",
    "verified": "FALSE",
    "protected": "FALSE",
    "listed_count": 0,
    "following": "FALSE",
    "retweeted_count": 150,
    "retweeted": "FALSE",
    "likes": 2,
    "posts": 200
}]
var rankingbyLikesListToApp = {
    'nodes': [
        { 'id': 'Bacha', 'label': 'circle' },
    ],
    'edges': [{
        'from': 'Bacha',
        'to': 'Junaid',
        'color': 0xff051e3e,
        'strokeWidth': 2,
        'imageURl': 'url'
    }]
}


try {
        var  tid  = personID;
	 tid = '1265630511415918592';
	console.log(tid);
        let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
        const url = `https://api.twitter.com/2/tweets/${tid}/liking_users`;

        var uusers = await get_liking_users_my_tweets(token, url);
	//console.log(uusers);
if (uusers.length == 0) {
            var resssss = {
                "msg": "No data found",
                "status": 301
            }
        } else {

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

                var ress = await client.query("INSERT INTO liking_users (name, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description, p_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *", [pname, location, id, username, verified, created_at, followers_count, following_count, tweet_count, listed_count, description, tid]);
            }

            if (ress.rowCount > 0) {
                var  resssss = {
                    "msg": "results.rows[0]",
                    "status": 200
                } // rows[0] mean we dont need all the data in response we just need to read the data that we are inserting in to db just. so we specify row[0]
            } else {
                var  resssss = {
                    "msg": "No data found",
                    "status": 301
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        console.log("Error occured");
    }


    
    const query = await client.query("SELECT * FROM liked_tweets WHERE p_id=$1", [personID]);
	console.log(query.rows);
    rankingbyLikesListToApp['nodes'].push({ 'id': UserInfo1[0].screen_name, 'label': 'circle' }, );
    for (let row of query.rows) {
        rankingbyLikesListToApp['nodes'].push({ 'id': 'row.screen_name', 'label': 'circle' }, );
        Wup = 1 - (row.like_count / 100);
            Wp_u = (Wup + 0.12) / 2
        rankingbyLikesListToApp['edges'].push({
            'from': UserInfo1[0].screen_name,
            'to': 'row.screen_name',
            'color': 0xff051e3e,
            'strokeWidth': Wp_u.toFixed(2),
            'imageURl': "https://pbs.twimg.com/profile_images/1434143486320812033/muR7wlEk_normal.jpg"
        }, );
    }
    rankingbyLikesListToApp.edges.sort(function(a, b) {
        var keyA = a.strokeWidth,
            keyB = b.strokeWidth;
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });
    return rankingbyLikesListToApp;
}
app.get("/RankingByLikesServer/:tid", async(req, res) => {
	const {tid} = req.params;
	console.log(tid);
    console.log('Likes wala API called successfully');
    var mynewdata = await RankingByLikesServer(tid);
    mynewdata['nodes'].shift();
    mynewdata['edges'].shift();
    //console.log(mynewdata);
    return res.json({ msg: mynewdata });
});


app.listen(5000, () => {
    console.log("Server has started on port 5000");
    dbStart();
})



