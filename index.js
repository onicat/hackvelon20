const Discord = require("discord.js");
const mongoose = require('mongoose');
const open = require('open');
const express = require('express');
const cors = require('cors');
const shuffle = require('shuffle-array');

const config = require("./config.json");
const User = require("./models/user");
const moment = require("moment");
const Agenda = require("agenda");

const clientAddress = 'http://localhost:3000';

// MongoDB

mongoose.connect('mongodb://localhost/undefined', {useUnifiedTopology: true, useNewUrlParser: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() { console.log('Connected successfully to MongoDB') });

// DiscordClient

const prefix = '!';
const discordClient = new Discord.Client();
const timeout = 600000;

discordClient.on('message', async function(mes) {
  if (mes.author.bot) return; 

  const userId = mes.author.id;
  const channelId = mes.channel.id;

  if (mes.content.startsWith(prefix)) {
    switch(mes.content) {
      case '!hello': {
        discordClient.channels.cache.get(channelId).send('Bot: Hello!');
        break;
      }
      case '!reg': {
        const user = await User.findOne({discordId: userId});
  
        if (user) {
          discordClient.channels.cache.get(channelId).send('Bot: Ты уже зарегистрирован. Пиши !start чтобы найти собеседника!');
          return;
        }
  
        await open(clientAddress + '/registration/' +  channelId + '/' + userId);
  
        break;
      }
      case '!start': {
        const user = await User.findOne({discordId: userId});
  
        if (!user) {
          discordClient.channels.cache.get(channelId).send('Bot: О, я вижу ты новенький? Тебе нужно зарегистрироваться через команду !reg');
          return;
        }
  
        await User.findOneAndUpdate({
          discordId: userId
        }, {
          inSearch: true
        });
  
        discordClient.channels.cache.get(channelId).send('Bot: Ищем тебе собеседника...');
  
        break;
      }
      case '!out': {
        const user = await User.findOneAndUpdate({
          discordId: userId
        }, {
          inSearch: false,
          talkWith: null
        });
  
        if (user.talkWith) {
          const interlocutor = await User.findOneAndUpdate({
            discordId: user.talkWith
          }, {
            inSearch: false,
            talkWith: null
          });
          
          discordClient.channels.cache.get(interlocutor.channelId).send('Bot: Собеседник покинул чат :(');
        }
  
        discordClient.channels.cache.get(channelId).send('Bot: Ты вышел из поиска и покинул все беседы');
      }
    }
  } else {
    const user = await User.findOne({discordId: userId});

    if (user.talkWith) {
      const interlocutor = await User.findOne({discordId: user.talkWith});

      discordClient.channels.cache.get(interlocutor.channelId).send(user.name + ': ' + mes.content);
    }
  }

});

discordClient.login(config.token);

// Server

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/user/info', (req, res) => {
  const {userId, name, city, about, tags, birthDate, gender, preference, channelId} = req.body;
  
  const age = moment().diff(birthDate, 'years', false);

  User.create({
    discordId: userId,
    name,
    city,
    about,
    tags: tags.split(',').map(value => value.trim()),
    age,
    gender,
    preference,
    inSearch: false,
    talkWith: null,
    channelId
  });

  res.send();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});

// Agenda

const agendaDbAddress = 'mongodb://localhost/agendaJobs';

const agenda = new Agenda({db: {address: agendaDbAddress}});

agenda.define('search for an interlocutor', async job => {
  const usersInSearch = await User.find({inSearch: true});

  shuffle(usersInSearch);

console.log(usersInSearch);
  while (usersInSearch.length) {
    const user = usersInSearch.pop();
    const interlocutorIndex = usersInSearch.findIndex(userInSearch => {
      if (user.preference === 'other' || user.preference === userInSearch.gender) {
        return true;
      } 
    });

    if (interlocutorIndex !== -1) {
      const interlocutor = usersInSearch.splice(interlocutorIndex, 1)[0];

      await User.findOneAndUpdate({discordId: user.discordId}, {inSearch: false, talkWith: interlocutor.discordId});
      await User.findOneAndUpdate({discordId: interlocutor.discordId}, {inSearch: false, talkWith: user.discordId});

      discordClient.channels.cache.get(user.channelId).send(`Bot: Нашел тебе кое-кого! Это ${interlocutor.name}: ${interlocutor.about}`);
      discordClient.channels.cache.get(interlocutor.channelId).send(`Bot: Нашел тебе кое-кого! Это ${user.name}: ${user.about}`);

    } else {
      discordClient.channels.cache.get(user.channelId).send('Bot: Никого пока не нашел. Поищу еще раз через 15 секунд');
    }
  }
});

agenda.define('check for inaction', async job => {

});

(async function() {
  await agenda.start();

  await agenda.every('15 seconds', 'search for an interlocutor');
  await agenda.every('2 minutes', 'check for inaction');
})();