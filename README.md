#leg\_bot


leg\_bot is a twitch chat bot for the Loading Ready Run Fan Streamer Community.


* leg\_bot gives track of any relevant stats (like **!death** or **!warcrime**) that the streamer wants kept track of.
* leg\_bot gives "useful" **!advice**. This advice is shared between channels to make sure that one streamers troubles with punching robots can help another win a MTGO draft.
* leg_bot gives information about when the next LRR or fan stream starts (**!nextlrr** and **!nextfan**)

If you want to contact me about leg_bot (bug reports, feedback, or if you want it in your channel) shoot me an email <urmasl@gmail.com>.

##Misc

* **!help** makes leg_bot give you a link to this page.
* **!live** makes leg_bot give you a list of awesome channels that are live at the moment.
* **!calendar** makes leg\_bot give you a link to the fan streamer calendar http://bit.ly/LRRFanStreamCalendar2
* **!lrr** makes leg\_bot throw a link to http://www.loadingreadyrun.com to the channel.

I have tried to add as many channels of the LRR fan stream community to the !live command as I could find.
If I am missing any, let me know.

##Calendar

* **!nextlrr** Tells you of any current and upcoming LRR streams.
* **!nextfan** Ditto for fan streams

Both of these commands can be followed with a timezone in the Continent/City format.

##Game

Many of leg\_bots functions depend on it knowing what game is currently being played. This is regularly queried from the Twitch API, but channel moderators can override it. Leg\_bot retrieves twith API data every 90 seconds.

* **!game** Shows what game leg\_bot thinks is being played.
* **!game override X** Forces leg\_bot to use X as the current game value. If you leave out X or set it to "off", leg\_bot will revert to using the value given by Twitch.

##Statistics

The statistics system for leg\_bot should be familiar to anyone who has used lrrbot or seen it in action.

* **!stats** gives you a list of statistics that leg_bot counts for the current channel. Use one of these instead of **(stat)** for the following commands.
* **!(stat)** increases the given stat by one.
* **!total(stat)** gives you a total count of the given statistic across all games.
* **!(stat)count** gives you a count of the given stat for the current game

**Mod-only commands**

* **(stat) add X** and **(stat) remove X** adds or removes a given ammount from the statistic for the current game. X defaults to 1 when not given.
* **(stat) set X** sets the value of the given statistic for the current game.

##Advice

* **!advice** Makes leg\_bot give an "useful" bit of advice.
* **!advice source** Shows information about the last given bit of advice: What channel is it from, what game was being played, and who added it.
* **!advice count** Shows you the ammount of advice that leg_bot knows.
* **!advice add X** This allows channel moderators to add X as a new advice. Note, that since advices are tied to games, you'll need to use **!game override** to set a game when adding advices when a stream isn't live. Also, to avoid any tomfoolery, a piece of advice cannot start with any nonalphanumeric characters.
