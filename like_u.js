// finding those accounts who like the given user id.
// this gives you information about the users who are liking my tweets. 

const needle = require("needle");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'

// You can replace the ID given with the Tweet ID you wish to like.
// You can find an ID by using the Tweet lookup endpoint

const csvWriter = createCsvWriter({
  path: 'user_likes.csv',
  header: [
    {id: 'name', title: 'Name'},
    {id: 'location', title: 'Location'},
    {id: 'id', title: 'Id'},
    {id: 'username', title: 'Username'},
    {id: 'verified', title: 'Verified'},
    {id: 'created_at', title: 'Created_at'},
    {id: 'followers_count', title: 'Followers_count'},
    {id: 'following_count', title: 'Following_count'},
    {id: 'tweet_count', title: 'Tweet_count'},
    {id: 'listed_count', title: 'Listed_count'},
    {id: 'description', title: 'Description'}
  ]
});

const id = "1354143047324299264";

let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';

// user who have liked a tweet
const endpointURL = `https://api.twitter.com/2/tweets/${id}/liking_users`;

async function getRequest(next_token) {
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


(async () => {
  try {
    var n_token = "7140dibdnow9c7btw4544b2105sgr3sr3e9wkidxn1sfq"
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
            name: response.data[j].name,
            location: response.data[j].location,
            id: `${response.data[j].id}g`,
            username: response.data[j].username,
            verified: response.data[j].verified,
            created_at: response.data[j].created_at,
            followers_count: response.data[j].public_metrics.followers_count,
            following_count: response.data[j].public_metrics.following_count,
            tweet_count: response.data[j].public_metrics.tweet_count,
            listed_count: response.data[j].public_metrics.listed_count,
            description: response.data[j].description
          },
        ];

        await csvWriter.writeRecords(data);
        // .then(()=> console.log('The CSV file was written successfully'));
      }
      n_token = response.meta.next_token;
      // kk = response.data[0].public_metrics.followers_count;
      
      // console.log("dsdd : ", kk)
      // console.log("ID: ", data_length)
      // result_count = response.meta.result_count;
      // if (result_count == 0) {stopped = true}
      // console.log("This is response: ", response.meta.next_token);
    }
  } catch (e) {
    console.log("error: ", e);
    process.exit(-1);
  }
  process.exit();
})();






