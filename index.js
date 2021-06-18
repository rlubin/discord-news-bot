require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI(process.env.NEWS_API)
const fetch = require('node-fetch')

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
	if (message.content === 'alerts1') {
		getPercentVolumeAbove(7, 150000).then((tickers) => {
			for (ticker of tickers) {
				// console.log(ticker)
				message.channel
					.send(`${ticker['symbol']} - ${ticker['name']}`)
					.catch((error) => console.log(error))
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
			return response.articles
		})
		.catch((error) => console.log(error))
}

const getPercentVolumeAbove = async (percent, volume) => {
	const tickers = await getTickersTSX()
	// for (ticker of tickers) {
	// 	console.log(ticker)
	// }
	// console.log(tickers)
	const tickers_above = await getPriceChangeVolumeLarger(
		tickers,
		percent,
		volume
	)
	// console.log(tickers_above)
	// return ['ABC.TO', 'BCD.TO']
	return tickers_above
}

const getTickersTSX = async () => {
	const url = 'https://financialmodelingprep.com/api/v3'
	const fmp_key = process.env.FMP_API
	return fetch(`${url}/symbol/available-tsx?apikey=${fmp_key}`)
		.then((res) => res.json())
		.then((tickers) => {
			let tickers_list = []
			for (ticker of tickers) {
				// console.log(ticker['symbol'])
				tickers_list.push({ symbol: ticker['symbol'], name: ticker['name'] })
			}
			return tickers_list
		})
		.catch((error) => console.log(error))
}

const getPriceChangeVolumeLarger = async (tickers, percent, volume) => {
	const matching_tickers = []
	for (ticker of tickers) {
		await sleep(200)
		data = await getDailyPriceData(ticker['symbol'])
		// console.log(data[0]['close'])
		// console.log(data[1]['close'])
		// console.log(data[0]['volume'])
		todays_close = data[0]['close']
		yestersdays_close = data[1]['close']
		todays_volume = data[0]['volume']
		// console.log(1.0 + percent * 0.01)
		// console.log(yestersdays_close * (1.0 + percent * 0.01))
		// console.log(todays_close)
		if (
			todays_close > yestersdays_close * (1.0 + percent * 0.01) &&
			todays_volume > volume
		) {
			matching_tickers.push(ticker)
		}
		// console.log(matching_tickers)
	}
	return matching_tickers
}

const sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const getDailyPriceData = async (ticker) => {
	const url = 'https://financialmodelingprep.com/api/v3'
	const fmp_key = process.env.FMP_API
	return fetch(`${url}/historical-price-full/${ticker}?apikey=${fmp_key}`)
		.then((res) => res.json())
		.then((price_data) => {
			return price_data['historical']
		})
		.catch((error) => console.log(error))
}

client.login(process.env.TOKEN)
