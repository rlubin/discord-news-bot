require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI(process.env.NEWS_API)

client.once('ready', () => {
	console.log('ready')
})

client.on('message', (message) => {
	if (message.content === 'sam is a clown') {
		const emoji = client.emojis.cache.get('788780192293716009')
		message.channel.send(`agreed ${emoji}`).catch('error')
	}
	if (message.content === 'get-news') {
		checkForNews().then((data) => {
			for (article of data) {
				message.channel.send(article.url).catch((error) => console.log(error))
			}
		})
	}
})

const checkForNews = async () => {
	const date = new Date()
	const yymmdd = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
	// console.log(yymmdd)
	return newsapi.v2
		.everything({
			q: 'bitcoin',
			sources: 'bbc-news,the-verge',
			domains: 'bbc.co.uk, techcrunch.com',
			from: '2021-05-16',
			to: '2021-06-16',
			language: 'en',
			sortBy: 'relevancy',
			page: 2,
		})
		.then((response) => {
			// console.log(response)
			// console.log(response.articles)
			// console.log(response.articles[0].url)
			// console.log(client)
			// console.log(client.channels.cache)
			// client.channels.cache.get('854714038457204786').send('found')
			// client.channels.cache.get('news').send(url)
			// return response.articles[0].url
			// console.log(typeof response)
			return response.articles
			/*
			{
				status: "ok",
				articles: [...]
			}
		*/
		})
		.catch((error) => console.log(error))
}

// runs every 15 minutes
// setInterval(checkForNews, 900000)

// checkForNews()

client.login(process.env.TOKEN)
