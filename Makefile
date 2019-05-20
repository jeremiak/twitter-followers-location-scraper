follower-locations.csv: follower-locations.json
	npx json2csv -i follower-locations.json -f handle,location -o follower-locations.csv

follower-locations.json: follower-handles.json
	node scrape-follower-locations.js

follower-handles.json: followers.json
	node scrape-follower-handles.js

clean:
	rm follower-locations.json
	rm follower-handles.json