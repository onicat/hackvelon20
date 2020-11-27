const Discord = require("discord.js");
const { MongoClient } = require("mongodb");
const config = require("./config.json");

const discordClient = new Discord.Client();
const mongoClient = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });

async function runMongo() {

  await mongoClient.connect();
  const DB = mongoClient.db('undefined');
  const users = DB.collection('users');
  
  console.log("Connected successfully to MongoDB");
}

discordClient.on('message', function(mes) {
  if (mes.author.bot) return; 

  switch(mes.content) {
    case '!hello':
      discordClient.channels.cache.get(mes.channel.id).send('Hello!');
      break;
  }
});

discordClient.on('channelCreate', function(mes) {
  discordClient.channels.cache.get(mes.channel.id).send('Hello!');
});

discordClient.on('ready', function() {
});

runMongo();
discordClient.login(config.token);