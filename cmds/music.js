const Discord = module.require("discord.js");
const YTDL = require("ytdl-core");
const getYoutubeId = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const sf = require("snekfetch");
const request = require("request");

var guilds = {};

module.exports.run = async (bot, message, args) => {
	const member = message.member;
	const msg = message.content.toLowerCase();
	const arg = message.content.split(' ').slice(2).join(" ");

	if(!guilds[message.guild.id]) {
		guilds[message.guild.id] = {
			queue: [],
			queueNames: [],
			isPlaying: false,
			voiceChannel: null,
			skipReq: 0,
			skipper: []
		};
	}

	if(args[0] === "play") {
		if(message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
			if(guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
				getId(arg, function(id) {
					add2Queue(id, message);
					fetchVideoInfo(id, function(err, videoInfo) {
						if(err) throw new Error(err);
						message.reply("Sabar Coy, Nih Lagu `" + videoInfo.title + "` Ane Masukin Ke List Dulu!");
						guilds[message.guild.id].queueNames.push(videoInfo.title);
					});
				});
			} else {
				guilds[message.guild.id].isPlaying = true;
				getId(arg, function(id) {
					guilds[message.guild.id].queue.push(id);
					playMusic(id, message);
					fetchVideoInfo(id, function(err, videoInfo) {
						if(err) throw new Error(err);
						message.reply("Ok Coy, Ane Putar Langsung Nih Lagu `" + videoInfo.title + "`!");
						guilds[message.guild.id].queueNames.push(videoInfo.title);
					});
				});
			}
		} else {
			message.reply("Masuk Voice Channel Dulu Coy!");
		}
	} else if(args[0] === "skip") {
		if(guilds[message.guild.id].skipper.indexOf(message.author.id) === -1) {
			guilds[message.guild.id].skipper.push(message.author.id);
			guilds[message.guild.id].skipReq++;
			if(guilds[message.guild.id].skipReq >= Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
				skipSong(message);
				message.reply("Ok Coy, Ane Skip Nih Lagu!");
			} else {
				message.reply("Sabar Coy, Butuh " + (Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq) + " Orang Lagi Buat Skip Nih Lagu!");
			}
		} else {
			message.reply("Ente Udh Ngevote Buat Skip Ini Lagu!");
		}
	} else if(args[0] === "list") {
		var text = "```";

		for(var i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
			var temp = (i + 1) + ": " + guilds[message.guild.id].queueNames[i] + (i === 0 ? " (~^Lagi Di Putar^~)" : "") + "\n";
			if((text + temp).length <= 2000 - 3) {
				text += temp;
			} else {
				text += "Belum Ada Lagu Yang Di Putar Coy!";
				message.channel.send(text);
				text += "```";
			}
		}

		text += "```";
		message.channel.send(text);
	} else if(args[0] === "stop") {
		if(message.guild.voiceConnection) {
			guilds[message.guild.id].queue = [];
			guilds[message.guild.id].queueNames = [];
			guilds[message.guild.id].isPlaying = false;
			guilds[message.guild.id].voiceChannel.leave();
		}
	}
}

function skipSong(message) {
	guilds[message.guild.id].dispatcher.end();
}

function playMusic(id, message) {
	guilds[message.guild.id].voiceChannel = message.member.voiceChannel;

	guilds[message.guild.id].voiceChannel.join().then(function(connection) {
		stream = YTDL("https://www.youtube.com/watch?v=" + id, { filter : "audioonly" });

		guilds[message.guild.id].skipReq = 0;
		guilds[message.guild.id].skipper = [];

		guilds[message.guild.id].dispatcher = connection.playStream(stream);
		guilds[message.guild.id].dispatcher.on("end", function() {
			guilds[message.guild.id].skipReq = 0;
			guilds[message.guild.id].skipper = [];
			guilds[message.guild.id].queue.shift();
			guilds[message.guild.id].queueNames.shift();

			if(guilds[message.guild.id].queue.length === 0) {
				guilds[message.guild.id].queue = [];
				guilds[message.guild.id].queueNames = [];
				guilds[message.guild.id].isPlaying = false;
				guilds[message.guild.id].voiceChannel.leave();
			} else {
				setTimeout(function() {
					playMusic(guilds[message.guild.id].queue[0], message);
				}, 500);
			}
		});		
	});
}

function add2Queue(id, message) {
	if(isYoutube(id)) {
		guilds[message.guild.id].queue.push(getYoutubeId(id));
	} else {
		guilds[message.guild.id].queue.push(id);
	}
}

function getId(str, callback) {
	if(isYoutube(str)) {
		callback(getYoutubeId(str));
	} else {
		searchVideo(str, function(id) {
			callback(id);
		});
	}
}

function searchVideo(query, callback) {
	sf.get("https://www.googleapis.com/youtube/v3/search?part=id&q=" + encodeURIComponent(query) + "&key=AIzaSyDniba_PMWgvX-41ROZL17tiysD9ffq-so").then(r => {
		var body = r.body;

		if(!body.items[0]) {
			callback("WIXjHt8KmUc");
		} else {
			callback(body.items[0].id.videoId);
		}
	});
}

function isYoutube(str) {
	return str.toLowerCase().indexOf("youtube.com") > -1;
}

module.exports.help = {
	name: "music"
}