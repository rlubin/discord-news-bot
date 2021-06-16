require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()

client.login(process.env.TOKEN)

client.on(
	'ready',
	(readyDiscord = () => {
		console.log('on')
	})
)
