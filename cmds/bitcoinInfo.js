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
		sf.get("https://vip.bitcoin.co.id/api/btc_idr/ticker").then(r => {
			let body = r.body;

			let embeb = new Discord.RichEmbed()
				.setTitle("Bitcoin Trade - Bitcoin.co.id")
				.setDescription("Harga Bitcoin")
				.setURL("https://vip.bitcoin.co.id/")
				.setThumbnail("https://www.bitcoin.co.id/homev2-assets/img/logo-bitcoin-30.png")
				.setTimestamp(moment.unix(body.ticker.server_time))
				.setFooter("Last Update Price", "https://bitcoin.org/img/icons/opengraph.png")
				.addField("Buy Price", numberWithCommas(body.ticker.buy, 2) + " IDR", true)
				.addField("Sell Price", numberWithCommas(body.ticker.sell, 2) + " IDR", true)
				//.addBlankField(true)
				.addField("Highest Price", numberWithCommas(body.ticker.high, 2) + " IDR", true)
				.addField("Lowest Price", numberWithCommas(body.ticker.low, 2) + " IDR", true)
				//.addBlankField(true)
				.addField("Last Price", numberWithCommas(body.ticker.last, 2) + " IDR", true);

			message.channel.send({embed: embeb});
		});
	}

	if(args[0] === "coinbase") {
		sf.get("https://api.coinbase.com/v2/prices/BTC-IDR/historic?period=hour").then(r => {
			let body = r.body;

			let pastHourPrice = body.data.prices[0].price - body.data.prices[360].price;
			let pastHourPercent = (body.data.prices[0].price - body.data.prices[360].price) / body.data.prices[360].price * 100;
			let plusOrMin = pastHourPrice.toString().indexOf("-") >= 0 ? "" : "+";

			let embeb = new Discord.RichEmbed()
				.setTitle("Harga Beli - coinbase.com")
				.setDescription("Harga Beli Bitcoin")
				.setURL("https://www.coinbase.com/")
				.setThumbnail("https://www.coinbase.com/assets/logos/logo@2x-facc8a78d7aa50ec2df3f7b1dd646105ccfc29991397499cd26f5aa8c781a9bb.png")
				.setTimestamp(moment(body.data.prices[0].time, moment.ISO_8601))
				.setFooter("Last Update Price", "https://www.coinbase.com/apple-touch-icon.png")
				.addField("Bitcoin Price", numberWithCommas(body.data.prices[0].price, 2) + " IDR", true)
				.addBlankField(true)
				.addField("Past Hour", plusOrMin + numberWithCommas(pastHourPrice, 2) + " IDR", true)
				.addField("Past Hour (%)", plusOrMin + numberWithCommas(pastHourPercent, 2) + "%", true);

			message.channel.send({embed: embeb});
		});
	}
}

module.exports.help = {
	name: "bitcoin"
}