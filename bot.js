const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");

const bot = new Discord.Client({disableEveryone: false});
const botSettings = require('./botSetting.json');
const prefix = botSettings.prefix;

bot.commands = new Discord.Collection();
fs.readdir("./cmds/", (err, files) => {
	if(err) console.error(err);

	let jsFiles = files.filter(f => f.split(".").pop() === "js");
	if(jsFiles.length <= 0) {
		console.log("No Commands To Load!");
		return;
	}

	console.log(`Loading ${jsFiles.length} Commands!`);

	jsFiles.forEach((f, i) => {
		let props = require(`./cmds/${f}`);
		console.log(`${i + 1}: ${f} Loaded!`);
		bot.commands.set(props.help.name, props);
	})
});

var con;

function mysqlService() {
	con = mysql.createConnection({
		host: process.env.dbHost,
		user: process.env.dbUser,
		password: process.env.dbPass,
		database: process.env.db
	});

	con.connect(err => {
		if(err) {
			console.log('Error When Connecting To DB:', err);
			setTimeout(mysqlService(), 2000);
		}
		console.log("Database Connected!");
	});

	con.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			mysqlService();
		} else {
			throw err;
		}
	});
}

//mysqlService();


bot.on('ready', async () => {
    console.log(`Bot Is Ready! ${bot.user.username}`);
    bot.user.setGame('~^Always Sleepy^~');
});

bot.on("message", async message => {
	if (message.author.bot) return;
	if(message.channel.type === "dm") return;

	let messageArray = message.content.split(/\s+/g);
	let command = messageArray[0];
	let args = messageArray.slice(1);

	if(!command.startsWith(prefix)) return;

	let cmd = bot.commands.get(command.slice(prefix.length));
	if(cmd) cmd.run(bot, message, args, con);
});


bot.login(process.env.botToken);