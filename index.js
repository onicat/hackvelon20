const Discord = require("discord.js");
const mongoose = require('mongoose');
const open = require('open');
const express = require('express');
const cors = require('cors')

const config = require("./config.json");
const User = require("./models/user");
const moment = require("moment");

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
  if (mes.author.bot || !mes.content.startsWith(prefix)) return; 

  const userId = mes.author.id;
  const channelId = mes.channel.id;

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

      await open(clientAddress + '/registration/' + userId);

      break;
    }
    case '!start': {
      const user = await User.findOne({discordId: userId});

      if (!user) {
        discordClient.channels.cache.get(channelId).send('Bot: О, я вижу ты новенький? Тебе нужно зарегистрироваться через команду !reg');
      }

      await User.findOneAndUpdate({
        discordId: userId
      }, {
        inSearch: true
      });

      discordClient.channels.cache.get(channelId).send('Bot: Ищем тебе собеседника...');

      break;
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
  const {id, name, city, about, tags, birthDate, gender, preference} = req.body;
  
  const age = moment().diff(birthDate, 'years', false);

  User.create({
    discordId: id,
    name,
    city,
    about,
    tags: tags.split(',').map(value => value.trim()),
    age,
    gender,
    preference,
    inSearch: false
  });

  res.send();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});