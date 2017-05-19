# Pony Weather

You need the `Timezonedb` API key to make the backend work

Once you got the API key, make a folder name `oauthTokens`

And inside `oauthTokens` make a JSON file named `token.json`

And inside the `token.json` the object should look something like this

```json
{
    "timezonedb": "<API KEY>"
}
```

Your directory should look something like that
```
oauthTokens/
└── token.json
```

Or you can set an environment variable named `TIMEZONEDB` and the vluae will be your `<TOKEN>`

Once everythign is set up, just run `yarn start` or `npm start`

And the serer by default will run on port `8080`

Or if you already set your PORT ENV variable, it will use the PORT instead

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

# API
```
GET | /api/<LOCATION>
http://localhost:8080/api/London
```

If you didn't pass in the `LOCATION`, the API will look for your current location via your public IP address

The API return come with different data set

And the current support one will be
- JSON
- XML

To fetch XML(or any other data set in the future)
```
GET | /api/<LOCATION>
http://localhost:8080/api/London?type=xml
```

A [Blog](https://felixfong227.tumblr.com/post/160630440298/week-end-hacking-project-1-pony-weather) about this week end hacks