const Discord = module.require("discord.js");
const sf = require("snekfetch");
var moment = module.require("moment");

function numberWithCommas(x, l) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if(parts[1]) parts[1] = parts[1].substr(0, l);
    return parts.join(",");
}

module.exports.run = async (bot, message, args) => {
	if(args[0] === "info") {
		sf.get("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001?key=" + process.env.steamAPI + "&vanityurl=" + args[1]).then(r => {
			let body = r.body;

			sf.get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + process.env.steamAPI + "&steamids=" + body.response.steamid).then(s => {
				let body2 = s.body;

				let embeb = new Discord.RichEmbed()
					.setTitle("Steam Profile")
					.setDescription(moment.unix(body2.response.players[0].lastlogoff));

				message.channel.send({embed: embeb});
			});
		});
	}
}

module.exports.help = {
	name: "steam"
}