const express = require('express');
const bodyParser = require('body-parser');
const dayJs = require('dayjs');
const axios = require('axios');

const { arrayToDic } = require('./util');

// config
require('dotenv').config();
const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

/** receive command from slack */
app.post('/', async (req, res) => {
  const allUsers = await getAllUsers();
  const allUsersDic = arrayToDic(allUsers, 'id');
  const channelUsers = await getChannelUsers(req.body.channel_id);
  const messages = await getMessages(req.body.channel_id);
  const messageUsers = messages.map((message) => message.user);
  const absentUsers = channelUsers.filter(
    (user) => !messageUsers.includes(user)
  );
  const absentUsersDetail = absentUsers.map(
    (userId) => allUsersDic[userId].name
  );
  const message = `People who didn't checkin: ${absentUsersDetail.join(' ,')}`;
  return res.json(message);
});

async function getAllUsers() {
  const params = {
    token: API_TOKEN,
  };

  const { data } = await axios.get(
    'https://slack.com/api/users.list',
    {
      params,
    },
    config
  );

  return data.members;
}

async function getChannelUsers(channel) {
  const params = {
    token: API_TOKEN,
    channel,
  };

  const { data } = await axios.get(
    'https://slack.com/api/conversations.members',
    {
      params,
    },
    config
  );

  return data.members;
}

async function getMessages(channel) {
  const todayDate = dayJs().format('YYYY-MM-DD');
  const oldest = dayJs(todayDate + 'T00:00:00').unix();
  const latest = dayJs(todayDate + 'T12:00:00').unix();
  const params = {
    token: API_TOKEN,
    channel,
    latest,
    oldest,
  };

  const { data } = await axios.get(
    'https://slack.com/api/conversations.history',
    {
      params,
    },
    config
  );

  return data.messages;
}

app.listen(PORT, () => console.log('Bot is listening on port ' + PORT));
