// THis code doesnt work. so please do not waste time here

const needle = require("needle");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'

const token = 'AAAAAAAAAAAAAAAAAAAAAK96ZgEAAAAAyUsPg2HSWmAPV813iso8vp1o0W4%3DspiZOVKaSe1i4em9hvXRSXyGslJ0Y2mGwR0Kp4PziirEhFwf7U';
const id = "2244994945"; 

const endpointURL = `https://api.twitter.com/2/lists/${id}/tweets`;

async function getRequest() {
  // These are the parameters for the API request
  // by default, only the Tweet ID and text are returned
  const params = {
    "tweet.fields": "lang,author_id", // Edit optional query parameters here
    "expansions": "author_id" // expansions is used to include the user object
    // "user.fields": "created_at", // Edit optional query parameters here
  };

  // this is the HTTP header that adds bearer token authentication
  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2ListTweetsLookupJS",
      authorization: `Bearer ${token}`,
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
    // Make request
    const response = await getRequest();
    console.dir(response, {
      depth: null,
    });
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();