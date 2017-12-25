module.exports.run = async (bot, message, args, con) => {
	let sql;

	if(args[0] === "register") {
		con.query(`SELECT * FROM author WHERE user_id = '${message.author.id}'`, (err, rows) => {
			if(err) throw err;

			if(rows.length < 1) {
				sql = `INSERT INTO author(user_id) VALUES('${message.author.id}')`;

				let role = message.guild.roles.find(r => r.name === message.author.discriminator + " Event");
				if(!role) {
					try {
						role = message.guild.createRole({
							name: message.author.discriminator + " Event",
							color: "#00FFAA",
							permissions: []
						});
					} catch(e) {
						console.log(e.stack);
					}
				}

				message.channel.send(`@everyone, Kang <@${message.author.id}> Lagi Ngadain Gift Away Nih!`);

				con.query(sql);
			}
		});
	}

	if(args[0] === "end") {
		con.query(`SELECT * FROM author WHERE user_id = '${message.author.id}'`, (err, rows) => {
			if(err) throw err;

			if(rows.length) {
				sql = `DELETE FROM author WHERE user_id = '${message.author.id}'`;

				let role = message.guild.roles.find(r => r.name === message.author.discriminator + " Event").delete();

				message.channel.send(`@everyone, ` + message.author.discriminator + " Event Sudah Berakhir");

				con.query(sql);
			}
		});
	}

	if(args[0] === "join") {
		if(args[1]) {
			let role = message.guild.roles.find(r => r.name === args[1] + " Event");
			if(role) {
				message.guild.members.get(message.author.id).addRole(role);
				message.replay("Join " + args[1] + " Event");
			} else {
				message.channel.send("Nomor " + args[1] + " Event Tidak Terdaftar!");
			}
		} else {
			message.channel.send("Tolong Coy, Nomor Event na Di Masukin!");
		}
	}

	if(args[0] === "roll") {
		let users = message.guild.roles.find(r => r.name === message.author.discriminator + " Event").members.map(m => m.user.id);
		let random = Math.floor((Math.random() * users.length));
		message.channel.send("Selamat Kepada <@" + users[random] + ">, Pemenang " + message.author.discriminator + " Event!");
	}

	if(args[0] === "list") {
		let roles = message.guild.roles.filter(r => r.name.includes("Event"));
		message.channel.send('```' + roles.map(r => r.name).join("\n") + '```');
	}
}

module.exports.help = {
	name: "event"
}