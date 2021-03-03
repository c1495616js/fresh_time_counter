const moment = require('moment-timezone');
const axios = require('axios');
const { App, ExpressReceiver } = require('@slack/bolt');

const { arrayToDic } = require('./util');

// config
require('dotenv').config();
const API_TOKEN = process.env.API_TOKEN;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const PORT = process.env.PORT || 8888;

// Initializes your app with your bot token and signing secret
const CALLBACK_ID = 'fresh_time_submitted';

const expressReceiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});
const app = new App({
  token: SLACK_BOT_TOKEN,
  receiver: expressReceiver,
});

const theView = (coworkers, channelId) => ({
  type: 'modal',
  callback_id: CALLBACK_ID,
  title: {
    type: 'plain_text',
    text: 'Fresh Times Check In',
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: 'Notify',
  },
  close: {
    type: 'plain_text',
    text: 'Cancel',
  },
  blocks: [
    {
      type: 'divider',
    },
    {
      type: 'input',
      block_id: 'coworkers_block',
      element: {
        type: 'multi_static_select',
        action_id: 'coworkers',
        placeholder: {
          type: 'plain_text',
          text: 'Select users',
          emoji: true,
        },
        options: coworkers.map(({ id, realName }) => ({
          text: {
            type: 'plain_text',
            text: realName,
          },
          value: id,
        })),
      },
      label: {
        type: 'plain_text',
        text: 'Peope who did not check in Today',
        emoji: true,
      },
    },

    {
      type: 'input',
      block_id: 'message_block',
      element: {
        type: 'plain_text_input',
        action_id: 'message_entered',
        multiline: true,
        initial_value: `Morning! Just checking in as I didn’t see your check in on <#${channelId}> this morning :slightly_smiling_face:`,
      },
      label: {
        type: 'plain_text',
        text: 'Message',
        emoji: true,
      },
    },
  ],
});

app.view(CALLBACK_ID, async ({ ack, body, view, context, client }) => {
  await ack();
  const coworkers =
    view['state']['values']['coworkers_block']['coworkers']['selected_options'];

  const message =
    view['state']['values']['message_block']['message_entered']['value'];

  coworkers.map(async (user) => {
    const text = `<@${user.value}> ${message}`;
    await client.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: user.value,
      text,
    });
  });
});

app.command('/fresh_times', async ({ body, ack, context, client }) => {
  try {
    await ack();
    const allUsers = await getAllUsers();
    const allUsersDic = arrayToDic(allUsers, 'id');
    const channelUsers = await getChannelUsers(body.channel_id);
    const messages = await getMessages(body.channel_id);
    const messageUsers = messages.map((message) => message.user);
    const absentUsers = channelUsers.filter(
      (user) => !messageUsers.includes(user)
    );
    const absentUsersWithDetail = absentUsers.map((userId) => ({
      id: userId,
      realName: allUsersDic[userId].profile.real_name,
    }));

    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: theView(absentUsersWithDetail, body.channel_id),
    });
  } catch (e) {
    console.log(e);
  }
});

app.command('/fresh_time', async ({ body, ack, context, client }) => {
  try {
    await ack();
    const allUsers = await getAllUsers();
    const allUsersDic = arrayToDic(allUsers, 'id');
    const channelUsers = await getChannelUsers(body.channel_id);
    const messages = await getMessages(body.channel_id);
    const messageUsers = messages.map((message) => message.user);
    const absentUsers = channelUsers.filter(
      (user) => !messageUsers.includes(user)
    );
    const absentUsersWithDetail = absentUsers.map((userId) => ({
      id: userId,
      realName: allUsersDic[userId].profile.real_name,
    }));

    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: theView(absentUsersWithDetail, body.channel_id),
    });
  } catch (e) {
    console.log(e);
  }
});

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});

(async () => {
  // Start your app
  await app.start(PORT);

  console.log('⚡️ Bolt app is running!');
})();

/** slack api */

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

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
  const todayDate = moment().tz('America/Los_Angeles').format('YYYY-MM-DD');
  // const timezoneDiff = 25200;
  const timezoneDiff = 28800;

  const oldest =
    moment(todayDate + 'T00:00:00')
      .tz('America/Los_Angeles')
      .unix() + timezoneDiff;
  const latest =
    moment(todayDate + 'T12:00:00')
      .tz('America/Los_Angeles')
      .unix() + timezoneDiff;

  const params = {
    token: API_TOKEN,
    channel,
    latest,
    oldest,
  };
  console.log(oldest, latest);
  const { data } = await axios.get(
    'https://slack.com/api/conversations.history',
    {
      params,
    },
    config
  );

  return data.messages;
}
