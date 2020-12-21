## Result

![](2020-04-24-12-03-41.png)

## usage

#### create new app

https://api.slack.com/apps
![](2020-04-24-12-19-01.png)

- Adding scope in OAuth & Permissions

![](2020-05-01-12-33-43.png)

#### slash command

![](2020-04-30-11-07-47.png)

![](2020-04-30-11-08-07.png)

#### type `/fresh_time` in the channel you want to count

![](2020-04-24-12-09-24.png)

## slack api

#### fetch all users info in slack

https://api.slack.com/methods/users.list

#### fetch all message in channel

https://api.slack.com/methods/conversations.history

#### fetch all members in channel

https://api.slack.com/methods/conversations.members

![](2020-04-24-00-41-05.png)

## Deploy to AWS Lightsail

- open the port 8888

![](2020-05-01-14-37-44.png)

## Refs

https://scotch.io/tutorials/create-a-custom-slack-slash-command-with-nodejs-and-express

---

# V2.0

## Key Steps

#### Add permission and scope

- Add file `.env`

```bash
cp .env-example .env
```

```bash
API_TOKEN=  // Under OAuth Permission, OAuth Access Token
SLACK_BOT_TOKEN= // Under OAuth Permission, Bot User OAuth Access Token
SLACK_SIGNING_SECRET=  // Under Basic Information
PORT= // whatever you want the port
```

![](2020-12-20-18-29-55.png)

![](2020-12-20-18-32-10.png)

- Add `chat:write` to the bot scope

![](2020-12-20-18-36-09.png)

- Add path `/slack/events` to `Request URL` under `Slash Commands`.

![](2020-12-20-18-42-00.png)

![](2020-12-20-18-41-29.png)

- Activate `Interactive and shorcuts` and Add path `/slack/events` to `Request URL`.
  ![](2020-12-20-18-25-56.png)

![](2020-12-20-18-21-21.png)

## Refs

- [Block Kit Builder](https://app.slack.com/block-kit-builder)

- https://github.com/seratch/bolt-starter

- https://slack.com/intl/en-ca/slack-tips/workflow-builder-examples

### Issues

- https://github.com/slackapi/bolt-js/issues/490
