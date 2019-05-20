# Twitter follower location scraper

Scrape the location of your Twitter followers without the API/rate limiting.

## Usage

1. Request and download [your data from Twitter](https://twitter.com/settings/your_twitter_data).
2. Change the `follower.js` file to a proper JSON file and put it in the same directory as this code base named `followers.json`.
3. You can run each step individually, or run them all with `make`.

## How the scraper works

1. First, convert each account ID to a username and create a file called `follower-handles.json`.
2. Use those usernames to scrape the public location from each profile and put the data in a file called `follower-locations.json`.
3. Convert that JSON file to a CSV so its easier to work with/search through called `follower-locations.csv`.