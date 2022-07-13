// Returns a list of users the specified user ID is following.
// https://developer.twitter.com/en/docs/twitter-api/users/follows/quick-start

const needle = require('needle');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'following.csv',
    header: [
      {id: 'verified', title: 'Verified'},
      {id: 'id', title: 'Id'},
      {id: 'description', title: 'Description'},
      {id: 'username', title: 'Username'},  
      {id: 'created_at', title: 'Created_at'},
      {id: 'name', title: 'Name'},
      {id: 'followers_count', title: 'Followers_count'},
      {id: 'following_count', title: 'Following_count'},
      {id: 'tweet_count', title: 'Tweet_count'},
      {id: 'listed_count', title: 'Listed_count'},
      {id: 'location', title: 'Location'}
    ]
  });

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

getFollowing();