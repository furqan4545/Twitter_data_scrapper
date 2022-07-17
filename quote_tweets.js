// Get Quote Tweets by Tweet ID
// https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets-lookup/quick-start
const express = require("express");
const cors = require("cors");
const client = require("./db"); 
const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
app.use(cors());
app.use(express.json());   

const csvWriter = createCsvWriter({
    path: 'quote_tweets.csv',
    header: [
      {id: 'created_at', title: 'Created_at'},
      {id: 'text', title: 'Text'},
      {id: 'id', title: 'Id'},
      {id: 'retweet_count', title: 'Retweet_count'},
      {id: 'reply_count', title: 'Reply_count'},
      {id: 'like_count', title: 'Like_count'},
      {id: 'quote_count', title: 'Quote_count'}
    ]
  });


const tweetId = 20;
const url = `https://api.twitter.com/2/tweets/${tweetId}/quote_tweets`;

const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

// this is the ID for @TwitterDev
const getQuoteTweets = async () => {
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
        let resp = await getPage(params, options, nextToken);
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

    data_length = quoteTweets.length;

    for (j = 0; j < data_length; j++) {
        const data = [
            {
            created_at: quoteTweets[j].created_at,
            text: quoteTweets[j].text,
            id: `${quoteTweets[j].id}g`,
            retweet_count: quoteTweets[j].public_metrics.retweet_count,
            reply_count: quoteTweets[j].public_metrics.reply_count,
            like_count: quoteTweets[j].public_metrics.like_count,
            quote_count: quoteTweets[j].public_metrics.quote_count
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

// getQuoteTweets();

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
        let resp = await getPage(params, options, nextToken, url);
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

            var ress = await client.query("INSERT INTO quote_tweets (created_at, text, id, retweet_count, reply_count, like_count, quote_count) VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING *", [created_at, text, id, retweet_count, reply_count, like_count, quote_count]);

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
