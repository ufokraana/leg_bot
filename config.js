module.exports = {
	channel: {
		//How long we keep an users mod status after twitch revokes it
		//(Twitch grants and revokes mod status all the time)
		modTimeout: 30000,
	},

	twitchAPI: {
		//Where we can find the api
		hostname: "api.twitch.tv",
		path: "/kraken/streams/%channel%",
		//How often we can query Twitch's API in milliseconds
		waitTime: 10 * 1000,
		//How often we DO query twitch's API in milliseconds
		interval: 5 * 60 * 1000,

	},
}
