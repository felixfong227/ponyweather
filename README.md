# Pony Weather

You need the `Timezonedb` API key to make the backend work

Once you got the API key, make a folder name `oauthTokens`

And inside `oauthTokens` make a JSON file named `timezonedb.json`

And inside the `timezonedb.json` the object should look something like this

```json
{
    "token": "<API KEY>"
}
```

Your directory should look something like that
```
oauthTokens/
└── timezonedb.json
```

Once everythign is set up, just run `yarn start` or `npm start`

And the serer by default will run on port `8080`

# Options

By default, the server will look for your current IP address and find the correct location
```
GET | /

http://localhost:8080/
```

But you can also input manually
```
GET | /<LOCATION>
http://localhost:8080/London
```

A [Blog](https://felixfong227.tumblr.com/post/160630440298/week-end-hacking-project-1-pony-weather) about this week end hacks