const needle = require("needle");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'retweeted_by.csv',
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

const token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

// You can replace the ID given with the Tweet ID you wish to lookup Retweeting users for
// You can find an ID by using the Tweet lookup endpoint
const id = "1354143047324299264";

const endpointURL = `https://api.twitter.com/2/tweets/${id}/retweeted_by`;

async function getRequest(next_token) {
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

(async () => {
  try {
    var n_token = "7140dibdnow9c7btw4543w41k13jxnpsxeghwd4nu9yy9"
    let stopped = false
    while(!stopped) {
      // Make request
      const response = await getRequest(n_token);
      console.dir(response, {
        depth: null,
      });
      result_count = response.meta.result_count;
      if (result_count == 0) {stopped = true; break}
      else if (response.status == 503) {stopped = true; break}

      data_length = response.data.length;

      for (j = 0; j < data_length; j++) {
        const data = [
          {
            verified: response.data[j].verified,
            id: `${response.data[j].id}g`,
            description: response.data[j].description,
            username: response.data[j].username,
            created_at: response.data[j].created_at,
            name: response.data[j].name,
            followers_count: response.data[j].public_metrics.followers_count,
            following_count: response.data[j].public_metrics.following_count,
            tweet_count: response.data[j].public_metrics.tweet_count,
            listed_count: response.data[j].public_metrics.listed_count,
            location: response.data[j].location
          },
      ];

      await csvWriter.writeRecords(data);
        // .then(()=> console.log('The CSV file was written successfully'));
      }
      n_token = response.meta.next_token;
    }
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();