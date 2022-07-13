// this code tells that what are the tweets liked by user. so it basically gives you tweet ids liked by specific user. 

const needle = require("needle");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'

const csvWriter = createCsvWriter({
  path: 'tweets_liked.csv',
  header: [
    {id: 'lang', title: 'Lang'},
    {id: 'place_id', title: 'Place_id'},
    {id: 'id', title: 'Id'},
    {id: 'source', title: 'Source'},
    {id: 'text', title: 'Text'},
    {id: 'created_at', title: 'Created_at'},
    {id: 'author_id', title: 'Author_id'},
    {id: 'retweet_count', title: 'Retweet_count'},
    {id: 'reply_count', title: 'Reply_count'},
    {id: 'like_count', title: 'Like_count'},
    {id: 'quote_count', title: 'Quote_count'}
  ]
});

let token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
// const token = '7140dibdnow9c7btw423wwmj7yaip007h9hpioql8wgfl';
const id = "2244994945";


// tweets liked by a user
// const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;
const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;

async function getRequest(next_token) {
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

(async () => {
  try {
    var n_token = "7140dibdnow9c7btw423wwn50dihtrzhathqw66brwqb8"
    let stopped = false
    while(!stopped) {
      //// Make request
      const response = await getRequest(n_token);
      console.dir(response, {
        depth: null,
      });
      result_count = response.meta.result_count;
      if (result_count == 0) {stopped = true; break}
      else if (response.status == 503) {stopped = true; break}
  
      data_length = response.data.length;

      for (j = 0; j < data_length; j++) {
        loca = response.data[j].geo;
        if (!loca){
          loca = ""
        }
        else {
          loca = response.data[j].geo.place_id
        }

        const data = [
          {
            lang: response.data[j].lang,
            place_id: loca,
            id: `${response.data[j].id}g`,
            source: response.data[j].source,
            text: response.data[j].text,
            created_at: response.data[j].created_at,
            author_id: response.data[j].author_id,
            retweet_count: response.data[j].public_metrics.retweet_count,
            reply_count: response.data[j].public_metrics.reply_count,
            like_count: response.data[j].public_metrics.like_count,
            quote_count: response.data[j].public_metrics.quote_count
          },
        ];

      await csvWriter.writeRecords(data);
      }
      n_token = response.meta.next_token;

    }

  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();

 
