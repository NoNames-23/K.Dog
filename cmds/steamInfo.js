const Discord = module.require("discord.js");
const sf = require("snekfetch");
var moment = module.require("moment");

function numberWithCommas(x, l) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if(parts[1]) parts[1] = parts[1].substr(0, l);
    return parts.join(",");
}

let communityVisibilityState = { 1 : "Private", 3 : "Public" };
let personaState = { 0 : "Offline", 1 : "Online", 2 : "Busy", 3 : "Away", 4 : "Snooze", 5 : "Looking To Trade", 6 : "Looking To Play" };
let statusBan = { "false" : "None", "true" : "Banned"};

module.exports.run = async (bot, message, args) => {
	if(args[0] === "info") {
		sf.get("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001?key=" + process.env.steamAPI + "&vanityurl=" + args[1]).then(r => {
			let body = r.body;

			if(body.response.success !== 1) return message.channel.send("Id Not Found!");
			
			let dataUser;
			let steamLvl;
			let userStatus;

			sf.get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + process.env.steamAPI + "&steamids=" + body.response.steamid).then(s => {
				dataUser = s.body.response.players[0];
			});

			sf.get("http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=" + process.env.steamAPI + "&steamid=" + body.response.steamid).then(s => {
				steamLvl = s.body.response.player_level;
			});

			sf.get("http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=" + process.env.steamAPI + "&steamids=" + body.response.steamid).then(s => {
				userStatus = s.body.players[0];
			});

			setTimeout(cb, 1000);

			function cb() {
				let embeb = new Discord.RichEmbed()
					.setTitle(dataUser.personaname)
					.setDescription("Joined Steam: " + moment.unix(dataUser.timecreated).format("DD MMMM YYYY"))
					.setURL("http://steamcommunity.com/profiles/" + dataUser.steamid)
					.setThumbnail(dataUser.avatarfull)
					.setTimestamp(moment.unix(dataUser.lastlogoff).format("YYYY-MM-DD HH:mm:ss"))
					.setFooter("Last Online", "http://store.akamai.steamstatic.com/public/images/v6/logo_steam_footer.png")
					.addField("Real Name", dataUser.realname ? dataUser.realname : "N/A", true)
					.addField("Profile Privacy", communityVisibilityState[dataUser.communityvisibilitystate], true)
					.addField("Steam Level", steamLvl, true)
					.addField("Trade Ban", userStatus.EconomyBan && userStatus.EconomyBan[0].toUpperCase() + userStatus.EconomyBan.slice(1), true)
					.addField("Online Status", personaState[dataUser.personastate], true)
					.addField("VAC Ban", statusBan[userStatus.VACBanned], true)
					.addField("SteamID", dataUser.steamid, true)
					.addField("Community Ban", statusBan[userStatus.CommunityBanned], true);

				message.channel.send({embed: embeb});
			}
		});
	}
}

module.exports.help = {
	name: "steam"
}
