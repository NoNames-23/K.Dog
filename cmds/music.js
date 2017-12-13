const Discord = module.require("discord.js");
const YTDL = require("ytdl-core");

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(YTDL(server.queue[0], { filter : "audioonly" }));
	server.queue.shift();
	server.dispatcher.on("end", function() {
		if(server.queue[0]) play(connection, message);
		else connection.disconnect();
	})
}

var servers = {};

module.exports.run = async (bot, message, args) => {
	if(args[0] === "play") {
		if(!args[1]) {
			message.channel.send("Linknya Mana Woi!");
			return;
		}

		if(!message.member.voiceChannel) {
			message.channel.send("Masuk Voice Channel Dulu Coy!");
			return;
		}

		if(!servers[message.guild.id]) {
			servers[message.guild.id] = { queue : [] };
		}

		var server = servers[message.guild.id];
		server.queue.push(args[1]);

		if(!message.guild.voiceConnection) {
			message.member.voiceChannel.join().then(function(connection) {
				play(connection, message);
			});
		}
	}

	if(args[0] === "skip") {
		var server = servers[message.guild.id];

		if(server.dispatcher) server.dispatcher.end();
	}

	if(args[0] === "stop") {
		var server = servers[message.guild.id];

		if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
	}
}

module.exports.help = {
	name: "music"
}