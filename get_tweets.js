// Get User Tweet timeline by user ID
// getting all tweets for specific user. 
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start

const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'tweets.csv',
    header: [
      {id: 'created_at', title: 'Created_at'},
      {id: 'text', title: 'Text'},
      {id: 'author_id', title: 'Author_id'},
      {id: 'id', title: 'Id'},
      {id: 'source', title: 'Source'},
      {id: 'lang', title: 'Lang'},
      {id: 'retweet_count', title: 'Retweet_count'},
      {id: 'reply_count', title: 'Reply_count'},
      {id: 'like_count', title: 'Like_count'},
      {id: 'quote_count', title: 'Quote_count'}
    ]
  });


// this is the ID for @TwitterDev
const userId = "2244994945";
const url = `https://api.twitter.com/2/users/${userId}/tweets`;

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = "AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U";

const getUserTweets = async () => {
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
        let resp = await getPage(params, options, nextToken);
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

    data_length = userTweets.length;

    for (j = 0; j < data_length; j++) {
        const data = [
            {
            created_at: userTweets[j].created_at,
            text: userTweets[j].text,
            author_id: userTweets[j].author_id,
            id: `${userTweets[j].id}g`,
            source: userTweets[j].source,
            lang: userTweets[j].lang,
            retweet_count: userTweets[j].public_metrics.retweet_count,
            reply_count: userTweets[j].public_metrics.reply_count,
            like_count: userTweets[j].public_metrics.like_count,
            quote_count: userTweets[j].public_metrics.quote_count
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

getUserTweets();