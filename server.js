var websocket = require("ws");
var crypto = require("crypto");
var salt = "i1s4wv2qh";
var filesystem = require("fs");
var cardsjs = require("./cards.js");
var websocketserver = new websocket.Server({port: 30666});
var cardsstats = [];
exports.cardsstats = cardsstats;
var serverclass;
var servertickrate = 32;
class HellsgateServer
{
	constructor()
	{
		this.battles = {};
		this.matchmakings = {};
		this.playersinbattle = {};
	}
	StartMatchmaking(playerid)
	{
		var playerrank = Number(filesystem.readFileSync("./accounts/" + playerid + ".account").toString().split(";")[5]);
		var forinflag = false;
		for (var matchmaking in this.matchmakings)
		{
			if (Math.abs(playerrank - this.matchmakings[matchmaking].player1file[5]) < 100)
			{
				forinflag = true;
				this.matchmakings[matchmaking].StartBattle(playerid);
				delete this.matchmakings[matchmaking];
				break;
			}
		}
		if (forinflag == true) return;
		var newbattle = new Battle(playerid);
		this.battles["battle_" + newbattle.battleid] = newbattle;
		this.matchmakings["matchmaking_" + playerid] = newbattle;
	}
	StopMatchmaking(playerid)
	{
		delete this.battles["battle_" + this.matchmakings["matchmaking_" + playerid].battleid];
		delete this.matchmakings["matchmaking_" + playerid];
	}
}
class Battle
{
	constructor(playerid)
	{
		this.player1id = playerid;
		this.player2id = 0;
		this.player1file = filesystem.readFileSync("./accounts/" + playerid + ".account").toString().split(";");
		this.player2file;
		this.player1cards;
		this.player2cards;
		this.player1squads;
		this.player2squads;
		this.player1squadcooldowns = [null, null, null];
		this.player2squadcooldowns = [null, null, null];
		this.player1resources = [68, 0];
		this.player2resources = [68, 0];
		this.player1production = [2, 0];
		this.player2production = [2, 0];
		this.player1productiondiminution = [0, 0];
		this.player2productiondiminution = [0, 0];
		this.player1economyupgrade = 0;
		this.player2economyupgrade = 0;
		this.player1zone = 18.75;
		this.player2zone = 18.75;
		this.productionloop;
		this.battleresult;
		this.battleid = Number(filesystem.readFileSync("./battles.id"));
		this.objects = [];
		this.nextobjectid = 1;
		this.starttimestamp;
		this.battlecountdown;
		this.lobbytimestamp;
		this.lobbytimout;
		filesystem.writeFileSync("./battles.id", (this.battleid + 1).toString());
	}
	StartBattle(playerid)
	{
		this.lobbytimestamp = Date.now();
		this.player2id = playerid;
		this.player2file = filesystem.readFileSync("./accounts/" + playerid + ".account").toString().split(";");
		serverclass.playersinbattle[this.player1id] = this.battleid;
		serverclass.playersinbattle[this.player2id] = this.battleid;
		console.log(this);
		var battleclass = this;
		this.lobbytimout = setTimeout(function ()
		{
			serverclass.playersinbattle[battleclass.player1id] = null;
			serverclass.playersinbattle[battleclass.player2id] = null;
			if ((!battleclass.player1squads || !battleclass.player1cards) && (battleclass.player2squads && battleclass.player2cards))
			{
				battleclass.battleresult = 2;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [8, "[+]"]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [9, "[+]"]]);
			}
			else if ((!battleclass.player2squads || !battleclass.player2cards) && (battleclass.player1squads && battleclass.player1cards))
			{
				battleclass.battleresult = 1;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [9, "[+]"]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [8, "[+]"]]);
			}
			else if ((!battleclass.player2squads || !battleclass.player2cards) && (!battleclass.player1squads || !battleclass.player1cards))
			{
				battleclass.battleresult = "n";
			}
			SendToPlayer(battleclass.player1id, "lend#" + battleclass.battleresult);
			SendToPlayer(battleclass.player2id, "lend#" + battleclass.battleresult);
		}, 60000);
		SendToPlayer(this.player1id, "link#lobby.php?id=" + this.battleid);
		SendToPlayer(this.player2id, "link#lobby.php?id=" + this.battleid);
	}
}
function GetRequestParameters(request)
{
	var result = [];
	if (request.includes("&"))
	{
		request.split("&").forEach(parameter =>
		{
			result[parameter.split("=")[0]] = parameter.split("=")[1];
		});
	}
	else result[request.split("=")[0]] = request.split("=")[1];
	return result;
}
serverclass = new HellsgateServer();
var cardsjson = JSON.parse(filesystem.readFileSync("cards.json"));
var cardattributes = ["id", "name", "class", "type", "health", "damage", "size", "speed", "attackspeed", "range", "targetrange", "rangetype", "cost", "productiondiminution"];
for (var card in cardsjson)
{
	var attributes = [];
	cardattributes.forEach (attributename =>
	{
		attributes[attributename] = cardsjson[card][attributename];
	});
	cardsstats[cardsjson[card]["id"]] = attributes;
}
var sendcards = SendCards();
websocketserver.on("connection", (connection) =>
{
	var file;
	var battleid;
	connection.on("message", (action) =>
	{
		action = action.toString();
		var actiontype = Number(action.split(";")[0]);
		main:
		switch (actiontype)
		{
			case 0: //requestparameters
				console.log();
				console.log();
				console.log();
				console.log(GetRequestParameters(action.split(";")[1]));
				var playerstate = GetRequestParameters(action.split(";")[1]).state;
				if (GetRequestParameters(action.split(";")[1]).key)
				{
					if (!filesystem.existsSync("./accounts/" + GetRequestParameters(action.split(";")[1]).key.split(".")[0] + ".account"))
					{
						connection.send("logerr#");
						connection.terminate();
						return;
					}
					file = filesystem.readFileSync("./accounts/" + GetRequestParameters(action.split(";")[1]).key.split(".")[0] + ".account").toString();
					if (file.split(";")[13] == GetRequestParameters(action.split(";")[1]).key && file.split(";")[13] != "-")
					{
						UpdateAccountFile("./accounts/" + GetRequestParameters(action.split(";")[1]).key.split(".")[0] + ".account", [[4, 1]]);
						connection.playerid = Number(file.split(";")[0]);
						console.log(connection.playerid + ": " + playerstate);
					}
					else
					{
						connection.send("logerr#");
						connection.terminate();
						return;
					}
				}
				if (GetRequestParameters(action.split(";")[1]).battleid)
				{
					battleid = Number(GetRequestParameters(action.split(";")[1]).battleid);
					console.log(battleid);
				}
				switch (playerstate)
				{
					case "battle":
						console.log("battle:");
						if (!serverclass.battles["battle_" + battleid])
						{
							console.log("brak bitwy!");
							break;
						}
						var battleclass = serverclass.battles["battle_" + battleid];
						if (battleclass.player1id != connection.playerid && battleclass.player2id != connection.playerid)
						{
							console.log("niezgodny gracz! " + battleclass.player1id + ", " + battleclass.player2id + ", " + connection.playerid);
							break;
						}
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						var playercards = battleclass["player" + playerside + "cards"][0];
						for (var i = 1; i < battleclass["player" + playerside + "cards"].length; i++) playercards = playercards + "," + battleclass["player" + playerside + "cards"][i];
						var playersquads = battleclass["player" + playerside + "squads"][0];
						for (var i = 1; i < battleclass["player" + playerside + "squads"].length; i++) playersquads = playersquads + "_" + battleclass["player" + playerside + "squads"][i];
						var connectionsend = sendcards + "&&&";
						if (battleclass.battleresult)
						{
							connectionsend = connectionsend + "bvars#" + battleclass.player1id + ";" + battleclass.player2id + ";" + battleclass.player1file[1] + ";" + battleclass.player2file[1] + ";" + playercards + ";" + playersquads + ";" + battleclass.player1zone + ";" + battleclass.player2zone + ";" + battleclass["player" + playerside + "economyupgrade"] + "&&&result#" + battleclass.battleresult + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "!" + file.split(";")[5] + ";" + battleclass["player" + playerside + "file"][5] + "&&&";
							connection.send(connectionsend);
							break;
						}
						if (serverclass.playersinbattle[connection.playerid] != battleid)
						{
							console.log("niezgodny playersinbattle array! " + serverclass.playersinbattle + ", " + connection.playerid);
							break;
						}
						if (!battleclass.player1cards && !battleclass.player2cards)
						{
							connectionsend = connectionsend + "link#lobby.php?id=" + battleid + "&&&";
							connection.send(connectionsend);
							break;
						}
						if (battleclass.starttimestamp)
						{
							connectionsend = connectionsend + "bvars#" + battleclass.player1id + ";" + battleclass.player2id + ";" + battleclass.player1file[1] + ";" + battleclass.player2file[1] + ";" + playercards + ";" + playersquads + ";" + battleclass.player1zone + ";" + battleclass.player2zone + ";" + battleclass["player" + playerside + "squadcooldowns"][0] + ";" + battleclass["player" + playerside + "squadcooldowns"][1] + ";" + battleclass["player" + playerside + "squadcooldowns"][2] + ";" + battleclass["player" + playerside + "economyupgrade"] + ";" + (Date.now() - battleclass.starttimestamp) + "&&&res#" + battleclass["player" + playerside + "resources"][0] + ";" + battleclass["player" + playerside + "resources"][1] + "_" + battleclass["player" + playerside + "production"][0] + ";" + battleclass["player" + playerside + "production"][1] + ";" + battleclass["player" + playerside + "productiondiminution"][0] + ";" + battleclass["player" + playerside + "productiondiminution"][1] + "_" + (Date.now() - battleclass.productiontimer) + "&&&" + SendEconomyObjects(battleclass.objects, playerside) + "&&&";
						}
						else connectionsend = connectionsend + "count#" + (Date.now() - battleclass.battlecountdown) + ";" + playercards + ";" + playersquads + ";" + battleclass.player1id + ";" + battleclass.player2id + "&&&";
						var cardattributes = ["id", "cardclass", "playerside", "type", "health", "damage", "size", "speed", "attackspeed", "range", "targetrange", "rangetype", "pos", "cooldown"];
						var cardssend = "";
						for (var o = 0; o < battleclass.objects.length; o++)
						{
							var card = battleclass.objects[o];
							for (var i = 0; i < cardattributes.length; i++)
							{
								if (cardattributes[i] == "pos") cardssend = cardssend + ";" + card[cardattributes[i]][0] + ":" + card[cardattributes[i]][1];
								else if (cardattributes[i] == "cooldown")
								{
									if (card.activationtime) cardssend = cardssend + ";" + card.activationtime;
									else if (card.lastattack) cardssend = cardssend + ";" + card.lastattack;
									else cardssend = cardssend + ";n";
								}
								else if (cardssend != "") cardssend = cardssend + ";" + card[cardattributes[i]];
								else cardssend = card[cardattributes[i]];
							}
						}
						if (battleclass.objects.length > 0) connectionsend = connectionsend + "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
						for (var object in battleclass.objects)
						{
							if (battleclass.objects[object].targetobject != null) connectionsend = connectionsend + "cardtrg#" + battleclass.objects[object].id + ";" + battleclass.objects[object].targetobject.id + "&&&";
						}
						console.log(connectionsend);
						connection.send(connectionsend);
						break;
					case "lobby":
						console.log("lobby");
						if (!serverclass.battles["battle_" + battleid])
						{
							console.log("brak bitwy!");
							break;
						}
						if (serverclass.playersinbattle[connection.playerid] != battleid)
						{
							console.log("niezgodny playersinbattle array! " + serverclass.playersinbattle + ", " + connection.playerid);
							break;
						}
						var battleclass = serverclass.battles["battle_" + battleid];
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						if (battleclass["player" + playerside + "cards"])
						{
							var playercards = battleclass["player" + playerside + "cards"][0];
							for (var i = 1; i < battleclass["player" + playerside + "cards"].length; i++) playercards = playercards + "," + battleclass["player" + playerside + "cards"][i];
						}
						else var playercards = "n";
						if (battleclass["player" + playerside + "squads"])
						{
							var playersquads = battleclass["player" + playerside + "squads"][0];
							for (var i = 1; i < battleclass["player" + playerside + "squads"].length; i++) playersquads = playersquads + "_" + battleclass["player" + playerside + "squads"][i];
						}
						else var playersquads = "n";
						var connectionsend = sendcards + "&&&lvars#" + battleclass.player1id + ";" + battleclass.player2id + ";" + battleclass.player1file[1] + ";" + battleclass.player2file[1] + ";" + battleclass.player1file[5] + ";" + battleclass.player2file[5] + ";" + battleclass.player1file[6] + ";" + battleclass.player2file[6] + ";" + playercards + ";" + playersquads + ";" + (60000 - (Date.now() - battleclass.lobbytimestamp)) + "&&&";
						if (battleclass.battleresult) connectionsend = connectionsend + "lend#" + battleclass.battleresult + "&&&";
						console.log(connectionsend);
						connection.send(connectionsend);
						break;
					case "index":
						console.log("index");
						if (GetRequestParameters(action.split(";")[1]).type == 0)
						{
							if (!GetRequestParameters(action.split(";")[1]).name.match(/^[0-9a-zA-Z]+$/))
							{
								connection.send("send#Name must be alphanumeric only!");
								return;
							}
							if (!GetRequestParameters(action.split(";")[1]).password.match(/^[0-9a-zA-Z]+$/))
							{
								connection.send("send#Password must be alphanumeric only!");
								return;
							}
							if (GetRequestParameters(action.split(";")[1]).name.length > 20 || GetRequestParameters(action.split(";")[1]).name.length < 5)
							{
								connection.send("send#Name must contain at least 5 signs and less than 20!");
								return;
							}
							if (GetRequestParameters(action.split(";")[1]).password.length > 25 || GetRequestParameters(action.split(";")[1]).password.length < 8)
							{
								connection.send("send#Password must contain at least 8 signs and less than 25!");
								return;
							}
							var files = filesystem.readdirSync("./accounts/");
							for (var filename in files)
							{
								var file = filesystem.readFileSync("./accounts/" + files[filename]).toString();
								if (file.split(";")[1] == GetRequestParameters(action.split(";")[1]).name)
								{
									connection.send("send#There is already an account with that name!");
									return;
								}
								if (file.split(";")[2] == GetRequestParameters(action.split(";")[1]).email)
								{
									connection.send("send#There is already an account assigned to this address!");
									return;
								}
							}
							var accountid = Number(filesystem.readFileSync("./accounts.id"));
							var key = (accountid + "." + Math.random().toString(16).substr(2, 8));
							filesystem.writeFileSync("./accounts/" + accountid + ".account", accountid + ";" + GetRequestParameters(action.split(";")[1]).name + ";" + GetRequestParameters(action.split(";")[1]).email + ";" + crypto.pbkdf2Sync(GetRequestParameters(action.split(";")[1]).password, salt, 1000, 64, "sha512").toString("hex") + ";1;0;0;0;0;0;0;-;true,-;" + key);
							filesystem.writeFileSync("./accounts.id", (accountid + 1).toString());
							connection.send("login#" + accountid + ";" + key + ";true,-");
						}
						else
						{
							var files = filesystem.readdirSync("./accounts/");
							for (var filename in files)
							{
								var file = filesystem.readFileSync("./accounts/" + files[filename]).toString();
								if (file.split(";")[2] == GetRequestParameters(action.split(";")[1]).email && file.split(";")[3] == crypto.pbkdf2Sync(GetRequestParameters(action.split(";")[1]).password, salt, 1000, 64, "sha512").toString("hex"))
								{
									var newkey = file.split(";")[0] + "." + Math.random().toString(16).substr(2, 8);
									UpdateAccountFile("./accounts/" + files[filename], [[4, 1], [13, newkey]]);
									connection.send("login#" + file.split(";")[0] + ";" + newkey + ";" + file.split(";")[12]);
								}
							}
							if (!newkey) connection.send("send#Wrong email or password!");
						}
						return;
					case "account":
						console.log("account");
						if (!GetRequestParameters(action.split(";")[1]).id) return;
						if (filesystem.existsSync("./accounts/" + GetRequestParameters(action.split(";")[1]).id + ".account"))
						{
							if (!filesystem.existsSync("./accounts/" + GetRequestParameters(action.split(";")[1]).id + ".account")) return;
							var file = filesystem.readFileSync("./accounts/" + GetRequestParameters(action.split(";")[1]).id + ".account").toString();
							connection.send("acc#" + file.split(";")[1] + ";" + file.split(";")[4] + ";" + file.split(";")[5] + ";" + file.split(";")[6] + ";" + file.split(";")[7] + ";" + file.split(";")[8] + ";" + file.split(";")[9] + ";" + file.split(";")[10] + ";" + file.split(";")[11]);
						}
						return;
					case "settings":
						console.log("settings");
						if (!file)
						{
							connection.send("send#Login first!");
							return;
						}
						if (file.split(";")[2] == GetRequestParameters(action.split(";")[1]).email && file.split(";")[3] == crypto.pbkdf2Sync(GetRequestParameters(action.split(";")[1]).password, salt, 1000, 64, "sha512").toString("hex"))
						{
							connection.send("set#" + file.split(";")[0] + ";" + file.split(";")[1]);
							break;
						}
						connection.send("send#Wrong email or password!");
						return;
					case "database":
						console.log("database");
						connection.send(sendcards);
						break;
					case "menu":
						console.log("menu");
						connection.send("mvars#" + file.split(";")[1] + ";" + file.split(";")[5] + ";" + file.split(";")[6] + ";" + file.split(";")[7] + ";" + file.split(";")[8] + ";" + file.split(";")[9] + ";" + file.split(";")[10] + ";" + file.split(";")[11]);
						break;
					case "rules":
						console.log("rules");
						break;
					default:
						console.log("brak stanu");
						break;
				}
				break;
			case 1: //matchmakingstart
				if (serverclass.matchmakings["matchmaking_" + connection.playerid])
				{
					connection.send("send#?eval?'You cannot start second matchmaking");
					break;
				}
				if (serverclass.playersinbattle[connection.playerid])
				{
					connection.send("send#?eval?'You cannot start matchmaking while you are in battle!' + SendAlertSupportButton(\"alertgotobutton\", \"?href?" + (serverclass.battles["battle_" + serverclass.playersinbattle[connection.playerid]]["player1squads"] != null && serverclass.battles["battle_" + serverclass.playersinbattle[connection.playerid]]["player2squads"] != null ? "battle" : "lobby") + ".php?id=" + serverclass.playersinbattle[connection.playerid] + "\", \"60%;60%;20%\", \"0 0 100 100\", \"<path/>\")");
					break;
				}
				serverclass.StartMatchmaking(connection.playerid);
				connection.send("mstart#");
				break;
			case 2: //matchmakingstop
				if (serverclass.playersinbattle[connection.playerid]) break;
				if (!serverclass.matchmakings["matchmaking_" + connection.playerid]) break;
				serverclass.StopMatchmaking(connection.playerid);
				connection.send("mstop#");
				break;
			case 3: //selectcardsandsquads
				if (serverclass.playersinbattle[connection.playerid] != battleid) break;
				var battleclass = serverclass.battles["battle_" + battleid];
				if (connection.playerid == battleclass.player1id) var playerside = 1;
				else var playerside = 2;
				if (battleclass["player" + playerside + "cards"])
				{
					connection.send("send#You have selected all cards!");
					break;
				}
				var cards = action.split(";")[1].split(",");
				var squads = action.split(";")[2].split("!");
				if (cards.length != 8)
				{
					connection.send("send#You have to select 8 cards!");
					break;
				}
				var nonbuildingcards = [];
				for (var card in cardsstats)
				{
					if (cardsstats[card]["type"] != 0) nonbuildingcards.push(cardsstats[card]["id"]);
				}
				if (nonbuildingcards.some(card => cards.includes(card)))
				{
					connection.send("send#The selected cards must be buildings!");
					break;
				}
				for (var squad in squads)
				{
					var thissquad = [];
					for (var troop in squads[squad].split("_"))
					{
						var troopposid = Number(squads[squad].split("_")[troop].split(":")[0]) + ":" + Number(squads[squad].split("_")[troop].split(":")[1].split("-")[0]) + "-" + Number(squads[squad].split("_")[troop].split(":")[1].split("-")[1]);
						if (thissquad.includes(troopposid))
						{
							connection.send("send#Troops in squads cannot stand on top of each other!");
							break main;
						}
						thissquad.push(Number(squads[squad].split("_")[troop].split(":")[0]), Number(squads[squad].split("_")[troop].split(":")[1].split("-")[0]), Number(squads[squad].split("_")[troop].split(":")[1].split("-")[1]));
					}
				}
				var squadsresult = [];
				for (var squad in squads)
				{
					var thissquad = [];
					for (var troop in squads[squad].split("_"))
					{
						thissquad.push(Number(squads[squad].split("_")[troop].split(":")[0]), Number(squads[squad].split("_")[troop].split(":")[1].split("-")[0]), Number(squads[squad].split("_")[troop].split(":")[1].split("-")[1]));
					}
					squadsresult.push(thissquad);
				}
				battleclass["player" + playerside + "squads"] = squadsresult;
				battleclass["player" + playerside + "cards"] = cards;
				if (battleclass.player1cards && battleclass.player2cards && battleclass.player1squads && battleclass.player2squads)
				{
					clearTimeout(battleclass.lobbytimout);
					battleclass.battlecountdown = Date.now();
					setTimeout(function ()
					{
						battleclass.battlecountdown = 0;
						battleclass.starttimestamp = Date.now();
						battleclass.productiontimer = battleclass.starttimestamp;
						var player1cards = battleclass.player1cards[0];
						for (var i = 1; i < battleclass.player1cards.length; i++) player1cards = player1cards + "," + battleclass.player1cards[i];
						var player2cards = battleclass.player2cards[0];
						for (var i = 1; i < battleclass.player2cards.length; i++) player2cards = player2cards + "," + battleclass.player2cards[i];
						var player1squads = battleclass.player1squads[0];
						for (var i = 1; i < battleclass.player1squads.length; i++) player1squads = player1squads + "_" + battleclass.player1squads[i];
						var player2squads = battleclass.player2squads[0];
						for (var i = 1; i < battleclass.player2squads.length; i++) player2squads = player2squads + "_" + battleclass.player2squads[i];
						SendToPlayer(battleclass.player1id, "bvars#" + battleclass.player1id + ";" + battleclass.player2id + ";" + battleclass.player1file[1] + ";" + battleclass.player2file[1] + ";" + player1cards + ";" + player1squads + ";" + battleclass.player1zone + ";" + battleclass.player2zone + ";" + battleclass.player1squadcooldowns[0] + ";" + battleclass.player1squadcooldowns[1] + ";" + battleclass.player1squadcooldowns[2] + ";" + battleclass.player1economyupgrade + ";1&&&res#" + battleclass.player1resources[0] + ";" + battleclass.player1resources[1] + "_" + battleclass.player1production[0] + ";" + battleclass.player1production[1] + ";" + battleclass.player1productiondiminution[0] + ";" + battleclass.player1productiondiminution[1] + "_0&&&" + SendEconomyObjects(battleclass.objects, 1) + "&&&");
						SendToPlayer(battleclass.player2id, "bvars#" + battleclass.player1id + ";" + battleclass.player2id + ";" + battleclass.player1file[1] + ";" + battleclass.player2file[1] + ";" + player2cards + ";" + player2squads + ";" + battleclass.player1zone + ";" + battleclass.player2zone + ";" + battleclass.player2squadcooldowns[0] + ";" + battleclass.player2squadcooldowns[1] + ";" + battleclass.player2squadcooldowns[2] + ";" + battleclass.player2economyupgrade + ";1&&&res#" + battleclass.player2resources[0] + ";" + battleclass.player2resources[1] + "_" + battleclass.player2production[0] + ";" + battleclass.player2production[1] + ";" + battleclass.player2productiondiminution[0] + ";" + battleclass.player2productiondiminution[1] + "_0&&&" + SendEconomyObjects(battleclass.objects, 2) + "&&&");
						battleclass.productionloop = setInterval(function ()
						{
							var ticktime = Date.now();
							var player1ironore = battleclass.player1production[0] - battleclass.player1productiondiminution[0];
							if (player1ironore < 0) player1ironore = 0;
							var player1energy = battleclass.player1production[1] - battleclass.player1productiondiminution[1];
							if (player1energy < 0) player1energy = 0;
							var player2ironore = battleclass.player2production[0] - battleclass.player2productiondiminution[0];
							if (player2ironore < 0) player2ironore = 0;
							var player2energy = battleclass.player2production[1] - battleclass.player2productiondiminution[1];
							if (player2energy < 0) player2energy = 0;
							battleclass.player1resources[0] += player1ironore;
							battleclass.player1resources[1] += player1energy;
							battleclass.player2resources[0] += player2ironore;
							battleclass.player2resources[1] += player2energy;
							SendToPlayer(battleclass.player1id, "res#" + battleclass.player1resources[0] + ";" + battleclass.player1resources[1] + "_" + battleclass.player1production[0] + ";" + battleclass.player1production[1] + ";" + battleclass.player1productiondiminution[0] + ";" + battleclass.player1productiondiminution[1] + "_" + (ticktime - battleclass.productiontimer));
							SendToPlayer(battleclass.player2id, "res#" + battleclass.player2resources[0] + ";" + battleclass.player2resources[1] + "_" + battleclass.player2production[0] + ";" + battleclass.player2production[1] + ";" + battleclass.player2productiondiminution[0] + ";" + battleclass.player2productiondiminution[1] + "_" + (ticktime - battleclass.productiontimer));
							battleclass.productiontimer = ticktime;
						}, 6000);
						BattleServerLoop(battleclass);
					}, 5000);
					SendToPlayer(battleclass.player1id, "link#battle.php?id=" + battleid);
					SendToPlayer(battleclass.player2id, "link#battle.php?id=" + battleid);
				}
				else connection.send("wfo#");
				break;
			case 4: //battleactions
				var battleactiontype = Number(action.split(";")[1].split("/")[0]);
				if (serverclass.playersinbattle[connection.playerid] != battleid) break;
				var battleclass = serverclass.battles["battle_" + battleid];
				if (battleclass.battleresult)
				{
					connection.send("send#The battle is over!");
					break;
				}
				if (!battleclass.starttimestamp)
				{
					connection.send("send#The battle has not yet begun!");
					break;
				}
				switch (battleactiontype)
				{
					case 0: //carddeploy
						var cardclass = Number(action.split(";")[1].split("/")[1]);
						var deploypos = [Number(action.split(";")[1].split("/")[2].split("-")[0]), Number(action.split(";")[1].split("/")[2].split("-")[1])];
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						if (cardsstats[cardclass]["cost"] > battleclass["player" + playerside + "resources"][0])
						{
							connection.send("send#You don't have enough resources!");
							break;
						}
						if (playerside == 1)
						{
							if (deploypos[0] + (cardsstats[cardclass]["size"] * (100 / 32)) > battleclass.player1zone)
							{
								connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
								break;
							}
							if (deploypos[0] + (cardsstats[cardclass]["size"] * (100 / 32)) > 100 - battleclass.player2zone)
							{
								connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
								break;
							}
						}
						else
						{
							if (deploypos[0] < 100 - battleclass.player2zone)
							{
								connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
								break;
							}
							if (deploypos[0] < battleclass.player1zone)
							{
								connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
								break;
							}
						}
						var economyobjects = 0;
						var flag = false;
						for (var object in battleclass.objects)
						{
							if (battleclass.objects[object].playerside == playerside && cardsjs.economycards.includes(battleclass.objects[object].cardclass)) economyobjects++;
							if (deploypos[0] < battleclass.objects[object].pos[0] + battleclass.objects[object].size * (100 / 32) && deploypos[0] + (cardsstats[cardclass]["size"] * (100 / 32)) > battleclass.objects[object].pos[0] && deploypos[1] < battleclass.objects[object].pos[1] + battleclass.objects[object].size * (100 / 16) && deploypos[1] + (cardsstats[cardclass]["size"] * (100 / 16)) > battleclass.objects[object].pos[1]) flag = true;
						}
						if (flag == true)
						{
							connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
							break;
						}
						if (cardsjs.economycards.includes(cardclass) && battleclass["player" + playerside + "economyupgrade"] + 3 == economyobjects)
						{
							connection.send("send#You cannot build any more economy buildings! Upgrade the economy!");
							break;
						}
						if (deploypos[0] > 100 - (cardsstats[cardclass]["size"] * (100 / 32)) || deploypos[1] > 100 - (cardsstats[cardclass]["size"] * (100 / 16)) || deploypos[0] < 0 || deploypos[1] < 0)
						{
							connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
							break;
						}
						var servercardclass = new cardsjs.cardsclasses["Card" + cardclass](battleclass, playerside, deploypos);
						battleclass.objects.push(servercardclass);
						UpdateZones(battleclass);
						var cardattributes = ["id", "cardclass", "playerside", "type", "health", "damage", "size", "speed", "attackspeed", "range", "targetrange", "rangetype", "pos", "cooldown"];
						var cardssend = servercardclass[cardattributes[0]];
						for (var i = 1; i < cardattributes.length; i++)
						{
							if (cardattributes[i] == "pos") cardssend = cardssend + ";" + servercardclass[cardattributes[i]][0] + ":" + servercardclass[cardattributes[i]][1];
							else if (cardattributes[i] == "cooldown")
							{
								if (servercardclass.activationtime) cardssend = cardssend + ";" + servercardclass.activationtime;
								else if (servercardclass.lastattack) cardssend = cardssend + ";" + servercardclass.lastattack;
								else cardssend = cardssend + ";n";
							}
							else cardssend = cardssend + ";" + servercardclass[cardattributes[i]];
						}
						var connectionsend = "res#" + battleclass["player" + playerside + "resources"][0] + ";" + battleclass["player" + playerside + "resources"][1] + "_" + battleclass["player" + playerside + "production"][0] + ";" + battleclass["player" + playerside + "production"][1] + ";" + battleclass["player" + playerside + "productiondiminution"][0] + ";" + battleclass["player" + playerside + "productiondiminution"][1] + "_" + (Date.now() - battleclass.productiontimer) + "&&&";
						if (cardsjs.economycards.includes(cardclass)) connectionsend = connectionsend + "ebn#" + (economyobjects + 1) + "&&&";
						connectionsend = connectionsend + "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
						connection.send(connectionsend);
						if (playerside == 2) SendToPlayer(battleclass.player1id, "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone);
						else SendToPlayer(battleclass.player2id, "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone);
						break;
					case 1: //cardremove
						var card = battleclass.objects.find(card => card.id == Number(action.split(";")[1].split("/")[1]));
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						if (typeof card.remove() != undefined) var removemethod = card.remove(playerside);
						else
						{
							connection.send("send#You can only remove buildings!");
							break;
						}
						if (removemethod == false)
						{
							connection.send("send#You can't remove opponent's cards!");
							break;
						}
						UpdateZones(battleclass);
						connection.send("decard#n;" + Number(action.split(";")[1].split("/")[1]) + ";0_" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&res#" + battleclass["player" + playerside + "resources"][0] + ";" + battleclass["player" + playerside + "resources"][1] + "_" + battleclass["player" + playerside + "production"][0] + ";" + battleclass["player" + playerside + "production"][1] + ";" + battleclass["player" + playerside + "productiondiminution"][0] + ";" + battleclass["player" + playerside + "productiondiminution"][1] + "_" + (Date.now() - battleclass.productiontimer) + "&&&" + SendEconomyObjects(battleclass.objects, playerside) + "&&&");
						if (playerside == 2) SendToPlayer(battleclass.player1id, "decard#n;" + Number(action.split(";")[1].split("/")[1]) + ";0_" + battleclass.player1zone + ";" + battleclass.player2zone);
						else SendToPlayer(battleclass.player2id, "decard#n;" + Number(action.split(";")[1].split("/")[1]) + ";0_" + battleclass.player1zone + ";" + battleclass.player2zone);
						break;
					case 2: //squaddeploy
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						if (Date.now() - battleclass["player" + playerside + "squadcooldowns"][action.split(";")[1].split("/")[1]] < 3000)
						{
							connection.send("send#You must wait for the end of the squad cooldown!");
							break;
						}
						var squad = battleclass["player" + playerside + "squads"][action.split(";")[1].split("/")[1]];
						var deploypos = [Number(action.split(";")[1].split("/")[2].split("-")[0]), Number(action.split(";")[1].split("/")[2].split("-")[1])];
						var totalcost = 0;
						for (var troop = 0; troop < squad.length / 3; troop++)
						{
							if (playerside == 1)
							{
								var resultdeploypos = [deploypos[0] + squad[troop * 3 + 1] * (100 / 32) - 2.5 * (100 / 32), deploypos[1] + squad[troop * 3 + 2] * (100 / 16) - 2.5 * (100 / 16)];
								if (resultdeploypos[0] + (cardsstats[squad[troop * 3]]["size"] * (100 / 32)) >= battleclass.player1zone)
								{
									connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
									break main;
								}
								if (resultdeploypos[0] + (cardsstats[squad[troop * 3]]["size"] * (100 / 32)) > 100 - battleclass.player2zone)
								{
									connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
									break main;
								}
							}
							else
							{
								var resultdeploypos = [deploypos[0] - squad[troop * 3 + 1] * (100 / 32) + 1.5 * (100 / 32), deploypos[1] + squad[troop * 3 + 2] * (100 / 16) - 2.5 * (100 / 16)];
								if (resultdeploypos[0] <= 100 - battleclass.player2zone)
								{
									connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
									break main;
								}
								if (resultdeploypos[0] < battleclass.player1zone)
								{
									connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
									break main;
								}
							}
							if (resultdeploypos[0] > 100 - (cardsstats[squad[troop * 3]]["size"] * (100 / 32)) || resultdeploypos[1] > 100 - (cardsstats[squad[troop * 3]]["size"] * (100 / 16)) || resultdeploypos[0] < 0 || resultdeploypos[1] < 0)
							{
								connection.send("send#The card must be deployed on the map, can't collide with any building and be placed on your zone!");
								break main;
							}
							totalcost += cardsstats[squad[troop * 3]]["cost"];
						}
						if (totalcost > battleclass["player" + playerside + "resources"][1])
						{
							connection.send("send#You don't have enough resources!");
							break;
						}
						var cardattributes = ["id", "cardclass", "playerside", "type", "health", "damage", "size", "speed", "attackspeed", "range", "targetrange", "rangetype", "pos", "cooldown"];
						var cardssend;
						for (var troop = 0; troop < squad.length / 3; troop++)
						{
							if (playerside == 1) var resultdeploypos = [deploypos[0] + squad[troop * 3 + 1] * (100 / 32) - 2.5 * (100 / 32), deploypos[1] + squad[troop * 3 + 2] * (100 / 16) - 2.5 * (100 / 16)];
							else var resultdeploypos = [deploypos[0] - squad[troop * 3 + 1] * (100 / 32) + 1.5 * (100 / 32), deploypos[1] + squad[troop * 3 + 2] * (100 / 16) - 2.5 * (100 / 16)];
							var servertroopclass = new cardsjs.cardsclasses["Card" + squad[troop * 3]](battleclass, playerside, resultdeploypos);
							battleclass.objects.push(servertroopclass);
							if (cardssend) cardssend = cardssend + ";" + servertroopclass[cardattributes[0]];
							else cardssend = servertroopclass[cardattributes[0]];
							for (var i = 1; i < cardattributes.length; i++)
							{
								if (cardattributes[i] == "pos") cardssend = cardssend + ";" + servertroopclass[cardattributes[i]][0] + ":" + servertroopclass[cardattributes[i]][1];
								else if (cardattributes[i] == "cooldown")
								{
									if (servertroopclass.activationtime) cardssend = cardssend + ";" + servertroopclass.activationtime;
									else if (servertroopclass.lastattack) cardssend = cardssend + ";" + servertroopclass.lastattack;
									else cardssend = cardssend + ";n";
								}
								else cardssend = cardssend + ";" + servertroopclass[cardattributes[i]];
							}
						}
						battleclass["player" + playerside + "squadcooldowns"][action.split(";")[1].split("/")[1]] = Date.now();
						UpdateZones(battleclass);
						connection.send("sss#&&&res#" + battleclass["player" + playerside + "resources"][0] + ";" + battleclass["player" + playerside + "resources"][1] + "_" + battleclass["player" + playerside + "production"][0] + ";" + battleclass["player" + playerside + "production"][1] + ";" + battleclass["player" + playerside + "productiondiminution"][0] + ";" + battleclass["player" + playerside + "productiondiminution"][1] + "_" + (Date.now() - battleclass.productiontimer) + "&&&recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&");
						if (playerside == 2) SendToPlayer(battleclass.player1id, "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone);
						else SendToPlayer(battleclass.player2id, "recard#" + cardssend + "!" + battleclass.player1zone + ";" + battleclass.player2zone);
						break;
					case 3: //upgradeeconomy
						if (connection.playerid == battleclass.player1id) var playerside = 1;
						else var playerside = 2;
						if (battleclass["player" + playerside + "resources"][0] >= 5 * Math.pow(2, battleclass["player" + playerside + "economyupgrade"] + 1) && battleclass["player" + playerside + "resources"][1] >= 5 * Math.pow(2, battleclass["player" + playerside + "economyupgrade"] + 1))
						{
							battleclass["player" + playerside + "economyupgrade"]++;
							battleclass["player" + playerside + "resources"][0] -= 5 * Math.pow(2, battleclass["player" + playerside + "economyupgrade"]);
							battleclass["player" + playerside + "resources"][1] -= 5 * Math.pow(2, battleclass["player" + playerside + "economyupgrade"]);
							connection.send("res#" + battleclass["player" + playerside + "resources"][0] + ";" + battleclass["player" + playerside + "resources"][1] + "_" + battleclass["player" + playerside + "production"][0] + ";" + battleclass["player" + playerside + "production"][1] + ";" + battleclass["player" + playerside + "productiondiminution"][0] + ";" + battleclass["player" + playerside + "productiondiminution"][1] + "_" + (Date.now() - battleclass.productiontimer) + "&&&eus#" + battleclass["player" + playerside + "economyupgrade"] + "&&&");
						}
						else connection.send("send#You don't have enough resources!");
						break;
				}
				break;
			case 5: //logout
				UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[13, "-"]]);
				break;
			case 6: //accountsettings
				var datatype = Number(action.split(";")[1].split("/")[0]);
				var data = action.split(";")[1].split("/")[1];
				var playerfile = filesystem.readFileSync("./accounts/" + connection.playerid + ".account").toString().split(";");
				switch (datatype)
				{
					case 0: //name
						if (data == playerfile[1])
						{
							connection.send("send#The data must be changed to some other than the current one!");
							break;
						}
						if (!data.match(/^[0-9a-zA-Z]+$/))
						{
							connection.send("send#Name must be alphanumeric only!");
							break;
						}
						if (data.length > 20 || data.length < 5)
						{
							connection.send("send#Name must contain at least 5 signs and less than 20!");
							break;
						}
						var files = filesystem.readdirSync("./accounts/");
						for (var filename in files)
						{
							var file = filesystem.readFileSync("./accounts/" + files[filename]).toString();
							if (file.split(";")[1] == data)
							{
								connection.send("send#There is already an account with that name!");
								break;
							}
						}
						UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[1, data]]);
						connection.send("dcs#0");
						break;
					case 1: //email
						if (data == playerfile[2])
						{
							connection.send("send#The data must be changed to some other than the current one!");
							break;
						}
						var files = filesystem.readdirSync("./accounts/");
						for (var filename in files)
						{
							var file = filesystem.readFileSync("./accounts/" + files[filename]).toString();
							if (file.split(";")[2] == data)
							{
								connection.send("send#There is already an account assigned to this address!");
								break;
							}
						}
						UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[2, data]]);
						connection.send("dcs#1");
						break;
					case 2: //password
						if (data == playerfile[3])
						{
							connection.send("send#The data must be changed to some other than the current one!");
							break;
						}
						if (!data.match(/^[0-9a-zA-Z]+$/))
						{
							connection.send("send#Password must be alphanumeric only!");
							break;
						}
						if (data.length > 25 || data.length < 8)
						{
							connection.send("send#Password must contain at least 8 signs and less than 25!");
							break;
						}
						UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[3, data]]);
						connection.send("dcs#2");
						break;
					case 3: //settings
						if (!data.includes(",") || data.split(",").length != 2)
						{
							connection.send("send#Incorrect settings!");
							break;
						}
						var filesettings = filesystem.readFileSync("./accounts/" + connection.playerid + ".account").toString().split(";")[12].split(",");
						if (Number(data.split(",")[0]) == 0) var result = data.split(",")[1];
						else var result = filesettings[0];
						for (var i = 1; i < filesettings.length; i++)
						{
							if (i != Number(data.split(",")[0])) result = result + "," + filesettings[i];
							else result = result + "," + data.split(",")[1];
						}
						UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[12, result]]);
						connection.send("scs#" + result);
						break;
					default: break;
				}
				break;
		}
	});
	connection.on("close", () =>
	{
		if (serverclass.matchmakings["matchmaking_" + connection.playerid]) serverclass.StopMatchmaking(connection.playerid);
		if (connection.playerid) UpdateAccountFile("./accounts/" + connection.playerid + ".account", [[4, 0]]);
	});
});
function BattleServerLoop(battleclass)
{
	setTimeout(function ()
	{
		var ticktime = Date.now();
		var player1send = "";
		var player2send = "";
		if (ticktime - battleclass.starttimestamp >= 600000)
		{
			clearInterval(battleclass.productionloop);
			serverclass.playersinbattle[battleclass.player1id] = null;
			serverclass.playersinbattle[battleclass.player2id] = null;
			if (battleclass.player1zone > battleclass.player2zone)
			{
				battleclass.battleresult = 1;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [9, "[+]"]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [8, "[+]"]]);
			}
			else if (battleclass.player1zone < battleclass.player2zone)
			{
				battleclass.battleresult = 2;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [8, "[+]"]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [9, "[+]"]]);
			}
			else
			{
				battleclass.battleresult = 0;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [10, "[+]"]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [10, "[+]"]]);
			}
			var player1newfile = filesystem.readFileSync("./accounts/" + battleclass.player1id + ".account").toString().split(";");
			var player2newfile = filesystem.readFileSync("./accounts/" + battleclass.player2id + ".account").toString().split(";");
			var player1rankupdate = Math.round((Number(battleclass.player2file[5]) + 400 * (Number(player1newfile[9]) - Number(player1newfile[8]))) / Number(player1newfile[7]));
			if (player1rankupdate < 0) player1rankupdate = 0;
			var player2rankupdate = Math.round((Number(battleclass.player1file[5]) + 400 * (Number(player2newfile[9]) - Number(player2newfile[8]))) / Number(player2newfile[7]));
			if (player2rankupdate < 0) player2rankupdate = 0;
			UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[5, player1rankupdate]]);
			UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[5, player2rankupdate]]);
			SendToPlayer(battleclass.player1id, "result#" + battleclass.battleresult + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "!" + player1rankupdate + ";" + battleclass.player1file[5]);
			SendToPlayer(battleclass.player2id, "result#" + battleclass.battleresult + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "!" + player2rankupdate + ";" + battleclass.player2file[5]);
			return;
		}
		var troops = [];
		var mvtroops = [];
		var mines = [];
		var destroyedcards = [];
		var areadamagesketchs = [];
		for (var object in battleclass.objects)
		{
			if (battleclass.objects[object].rangetype != 0 && battleclass.objects[object].type == 0)
			{
				if (battleclass.objects[object].targetobject == null) var detecttarget = DetectTargetBuilding(battleclass.objects[object]);
				else if (!battleclass.objects.includes(battleclass.objects[object].targetobject)) var detecttarget = DetectTargetBuilding(battleclass.objects[object]);
				else var detecttarget = { playerssend: ["", ""], result: battleclass.objects[object].targetobject };
				player1send = player1send + detecttarget.playerssend[0];
				player2send = player2send + detecttarget.playerssend[1];
				if (detecttarget.result != false)
				{
					if (ticktime - battleclass.objects[object].lastattack >= battleclass.objects[object].attackspeed * 1000)
					{
						battleclass.objects[object].lastattack = ticktime;
						var areadamagesketchsendattacks = false;
						var sendattacksbool = false;
						var sendattacks = null;
						var areadamagesketch = false;
						var targetobjects = battleclass.objects[object].attacktargets(detecttarget.result);
						if (battleclass.objects[object].areadamage)
						{
							for (var targetobject in targetobjects)
							{
								var checksupportcards = CheckSupportCards(battleclass.objects[object]);
								if (checksupportcards.result == true) targetobjects[targetobject].health -= battleclass.objects[object].damage * checksupportcards.modifier;
								else targetobjects[targetobject].health -= battleclass.objects[object].damage;
								if (targetobjects[targetobject].health < 1)
								{
									CheckDestroyEvent(battleclass.objects[object], destroyedcards);
									if (areadamagesketch == false)
									{
										areadamagesketch = true;
										areadamagesketchs.push([targetobjects[targetobject].id, GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + battleclass.objects[object].areadamage]);
									}
									destroyedcards.push([battleclass.objects[object], targetobjects[targetobject]]);
									battleclass.objects[object].targetobject = null;
								}
								else
								{
									if (areadamagesketch == false)
									{
										areadamagesketch = true;
										areadamagesketchsendattacks = true;
									}
									sendattacksbool = true;
									if (!sendattacks) sendattacks = battleclass.objects[object].id + ";" + targetobjects[targetobject].id + ";" + targetobjects[targetobject].health + ";" + (battleclass.objects[object].attackspeed * 1000 - (ticktime - battleclass.objects[object].lastattack)) / 1000;
									else sendattacks = sendattacks + "_" + battleclass.objects[object].id + ";" + targetobjects[targetobject].id + ";" + targetobjects[targetobject].health; + ";" + (battleclass.objects[object].attackspeed * 1000 - (ticktime - battleclass.objects[object].lastattack)) / 1000;
								}
							}
						}
						else
						{
							var checksupportcards = CheckSupportCards(battleclass.objects[object]);
							if (checksupportcards.result == true) targetobjects.health -= battleclass.objects[object].damage * checksupportcards.modifier;
							else targetobjects.health -= battleclass.objects[object].damage;
							if (targetobjects.health < 1)
							{
								CheckDestroyEvent(battleclass.objects[object], destroyedcards);
								destroyedcards.push([battleclass.objects[object], targetobjects]);
								battleclass.objects[object].targetobject = null;
							}
							else
							{
								sendattacksbool = true;
								if (!sendattacks) sendattacks = battleclass.objects[object].id + ";" + targetobjects.id + ";" + targetobjects.health + ";" + (battleclass.objects[object].attackspeed * 1000 - (ticktime - battleclass.objects[object].lastattack)) / 1000;
								else sendattacks = sendattacks + "_" + battleclass.objects[object].id + ";" + targetobjects.id + ";" + targetobjects.health + ";" + (battleclass.objects[object].attackspeed * 1000 - (ticktime - battleclass.objects[object].lastattack)) / 1000;
							}
						}
						if (sendattacksbool == true)
						{
							if (areadamagesketchsendattacks == true)
							{
								player1send = player1send + "attcard#" + GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + battleclass.objects[object].areadamage + "!" + sendattacks + "&&&";
								player2send = player2send + "attcard#" + GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + battleclass.objects[object].areadamage + "!" + sendattacks + "&&&";
							}
							else
							{
								player1send = player1send + "attcard#" + sendattacks + "&&&";
								player2send = player2send + "attcard#" + sendattacks + "&&&";
							}
						}
					}
				}
			}
			if (battleclass.objects[object].type != 0) troops.push(battleclass.objects[object]);
			if (battleclass.objects[object].cardclass == 5) mines.push(battleclass.objects[object]);
		}
		for (var troop in troops)
		{
			if (troops[troop].cardclass == 13)
			{
				if (ticktime - troops[troop].lastheal >= 1000)
				{
					var targetsupport = DetectTargetSupport(troops[troop], true);
					if (targetsupport)
					{
						troops[troop].lastheal = ticktime;
						player1send = player1send + targetsupport[0];
						player2send = player2send + targetsupport[1];
					}
				}
				continue;
			}
			var detecttarget = DetectTargetTroop(troops[troop]);
			player1send = player1send + detecttarget.playerssend[0];
			player2send = player2send + detecttarget.playerssend[1];
			if (typeof detecttarget.result == "object")
			{
				if (ticktime - troops[troop].lastattack >= troops[troop].attackspeed * 1000)
				{
					troops[troop].lastattack = ticktime;
					var areadamagesketchsendattacks = false;
					var sendattacksbool = false;
					var sendattacks = null;
					var areadamagesketch = false;
					var targetobjects = troops[troop].attacktargets(detecttarget.result);
					if (troops[troop].areadamage)
					{
						for (var targetobject in targetobjects)
						{
							var checksupportcards = CheckSupportCards(battleclass.objects[object]);
							if (checksupportcards.result == true) targetobjects[targetobject].health -= troops[troop].damage * checksupportcards.modifier;
							else targetobjects[targetobject].health -= troops[troop].damage;
							if (targetobjects[targetobject].health < 1)
							{
								CheckDestroyEvent(battleclass.objects[object], destroyedcards);
								if (areadamagesketch == false)
								{
									areadamagesketch = true;
									areadamagesketchs.push([targetobjects[targetobject].id, GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + troops[troop].areadamage]);
								}
								destroyedcards.push([troops[troop], targetobjects[targetobject]]);
								troops[troop].targetobject = null;
							}
							else
							{
								if (areadamagesketch == false)
								{
									areadamagesketch = true;
									areadamagesketchsendattacks = true;
								}
								sendattacksbool = true;
								if (!sendattacks) sendattacks = troops[troop].id + ";" + targetobjects[targetobject].id + ";" + targetobjects[targetobject].health + ";" + (troops[troop].attackspeed * 1000 - (ticktime - troops[troop].lastattack)) / 1000;
								else sendattacks = sendattacks + "_" + troops[troop].id + ";" + targetobjects[targetobject].id + ";" + targetobjects[targetobject].health + ";" + (troops[troop].attackspeed * 1000 - (ticktime - troops[troop].lastattack)) / 1000;
							}
						}
					}
					else
					{
						var checksupportcards = CheckSupportCards(battleclass.objects[object]);
						if (checksupportcards.result == true) targetobjects.health -= troops[troop].damage * checksupportcards.modifier;
						else targetobjects.health -= troops[troop].damage;
						if (targetobjects.health < 1)
						{
							CheckDestroyEvent(battleclass.objects[object], destroyedcards);
							destroyedcards.push([troops[troop], targetobjects]);
							troops[troop].targetobject = null;
						}
						else
						{
							sendattacksbool = true;
							console.log(troops[troop]);
							if (!sendattacks) sendattacks = troops[troop].id + ";" + targetobjects.id + ";" + targetobjects.health + ";" + (troops[troop].attackspeed * 1000 - (ticktime - troops[troop].lastattack)) / 1000;
							else sendattacks = sendattacks + "_" + troops[troop].id + ";" + targetobjects.id + ";" + targetobjects.health + ";" + (troops[troop].attackspeed * 1000 - (ticktime - troops[troop].lastattack)) / 1000;
						}
					}
					if (sendattacksbool == true)
					{
						if (areadamagesketchsendattacks == true)
						{
							player1send = player1send + "attcard#" + GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + troops[troop].areadamage + "!" + sendattacks + "&&&";
							player2send = player2send + "attcard#" + GetPivotPos(detecttarget.result).x + ";" + GetPivotPos(detecttarget.result).y + ";" + troops[troop].areadamage + "!" + sendattacks + "&&&";
						}
						else
						{
							player1send = player1send + "attcard#" + sendattacks + "&&&";
							player2send = player2send + "attcard#" + sendattacks + "&&&";
						}
					}
				}
			}
		}
		for (var mine in mines)
		{
			if (mines[mine].activationtime > ticktime) continue;
			for (var troop in troops)
			{
				if (troops[troop].playerside == mines[mine].playerside || troops[troop].type != 1) continue;
				var trooppos = GetPivotPos(troops[troop]);
				if (trooppos.x < mines[mine].pos[0]) var xdistance = trooppos.x - mines[mine].pos[0];
				else if (trooppos.x > mines[mine].pos[0] + mines[mine].size * (100 / 32)) var xdistance = trooppos.x - (mines[mine].pos[0] + mines[mine].size * (100 / 32));
				else var xdistance = 0;
				if (trooppos.y < mines[mine].pos[1]) var ydistance = trooppos.y - mines[mine].pos[1];
				else if (trooppos.y > mines[mine].pos[1] + mines[mine].size * (100 / 16)) var ydistance = trooppos.y - (mines[mine].pos[1] + mines[mine].size * (100 / 16));
				else var ydistance = 0;
				var distance = Math.sqrt((xdistance / (100 / 32)) * (xdistance / (100 / 32)) + (ydistance / (100 / 16)) * (ydistance / (100 / 16)));
				if (distance <= mines[mine].size / 2)
				{
					destroyedcards.push([mines[mine], troops[troop]]);
					var minessendattacksbool = false;
					var minessendattacks = null;
					var explosiontargets = mines[mine].explosiontargets(troops[troop]);
					for (var targetobject in explosiontargets)
					{
						explosiontargets[targetobject].health -= mines[mine].damage;
						if (explosiontargets[targetobject].health < 1) destroyedcards.push([mines[mine], explosiontargets[targetobject]]);
						else
						{
							minessendattacksbool = true;
							if (!minessendattacks) minessendattacks = mines[mine].id + ";" + explosiontargets[targetobject].id + ";" + explosiontargets[targetobject].health + ";0";
							else minessendattacks = minessendattacks + "_" + mines[mine].id + ";" + explosiontargets[targetobject].id + ";" + explosiontargets[targetobject].health + ";0";
						}
					}
					areadamagesketchs.push([mines[mine].id, GetPivotPos(mines[mine]).x + ";" + GetPivotPos(mines[mine]).y + ";" + mines[mine].areadamage]);
					destroyedcards.push(["n", mines[mine]]);
					if (minessendattacksbool == true)
					{
						player1send = player1send + "attcard#" + minessendattacks + "&&&";
						player2send = player2send + "attcard#" + minessendattacks + "&&&";
					}
				}
			}
		}
		if (destroyedcards.length > 0)
		{
			for (var destroyedcard in destroyedcards)
			{
				if (!battleclass.objects.includes(destroyedcards[destroyedcard][1])) continue;
				destroyedcards[destroyedcard][1].destroy();
				UpdateZones(battleclass);
				var flag = false;
				for (var sketch in areadamagesketchs)
				{
					if (areadamagesketchs[sketch][0] == destroyedcards[destroyedcard][1].id)
					{
						if (destroyedcards[destroyedcard][0] != "n") var destroyingcardid = destroyedcards[destroyedcard][0].id;
						else var destroyingcardid = "n";
						if (destroyedcards[destroyedcard][0] != "n" && destroyedcards[destroyedcard][0].lastattack) var destroyingcardcooldown = (destroyedcards[destroyedcard][0].attackspeed * 1000 - (ticktime - destroyedcards[destroyedcard][0].lastattack)) / 1000;
						else var destroyingcardcooldown = 0;
						flag = true;
						player1send = player1send + "decard#" + areadamagesketchs[sketch][1] + "!" + destroyingcardid + ";" + destroyedcards[destroyedcard][1].id + ";" + destroyingcardcooldown + "_" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
						player2send = player2send + "decard#" + areadamagesketchs[sketch][1] + "!" + destroyingcardid + ";" + destroyedcards[destroyedcard][1].id + ";" + destroyingcardcooldown + "_" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
						eval("player" + destroyedcards[destroyedcard][1].playerside + "send = player" + destroyedcards[destroyedcard][1].playerside + "send + 'res#" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "resources"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "resources"][1] + "_" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "production"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "production"][1] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "productiondiminution"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "productiondiminution"][1] + "_" + (ticktime - battleclass.productiontimer) + "' + '&&&" + SendEconomyObjects(battleclass.objects, destroyedcards[destroyedcard][1].playerside) + "&&&'");
						break;
					}
				}
				if (!flag)
				{
					if (destroyedcards[destroyedcard][0] != "n") var destroyingcardid = destroyedcards[destroyedcard][0].id;
					else var destroyingcardid = "n";
					if (destroyedcards[destroyedcard][0] != "n" && destroyedcards[destroyedcard][0].lastattack) var destroyingcardcooldown = (destroyedcards[destroyedcard][0].attackspeed * 1000 - (ticktime - destroyedcards[destroyedcard][0].lastattack)) / 1000;
					else var destroyingcardcooldown = 0;
					player1send = player1send + "decard#" + destroyingcardid + ";" + destroyedcards[destroyedcard][1].id + ";" + destroyingcardcooldown + "_" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
					player2send = player2send + "decard#" + destroyingcardid + ";" + destroyedcards[destroyedcard][1].id + ";" + destroyingcardcooldown + "_" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
					eval("player" + destroyedcards[destroyedcard][1].playerside + "send = player" + destroyedcards[destroyedcard][1].playerside + "send + 'res#" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "resources"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "resources"][1] + "_" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "production"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "production"][1] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "productiondiminution"][0] + ";" + battleclass["player" + destroyedcards[destroyedcard][1].playerside + "productiondiminution"][1] + "_" + (ticktime - battleclass.productiontimer) + "' + '&&&" + SendEconomyObjects(battleclass.objects, destroyedcards[destroyedcard][1].playerside) + "&&&'");
				}
			}
		}
		if (troops.length > 0)
		{
			var cards = "";
			for (var troop in troops)
			{
				var flag = false;
				for (var destroyedcard in destroyedcards)
				{
					if (destroyedcards[destroyedcard][1] == troops[troop])
					{
						flag = true;
						break;
					}
				}
				if (flag) continue;
				if (troops[troop].cardclass == 13 || troops[troop].cardclass == 17)
				{
					var detecttarget = DetectTargetSupport(troops[troop]);
					if (detecttarget)
					{
						player1send = player1send + detecttarget[0];
						player2send = player2send + detecttarget[1];
						var thistrooppos = GetPivotPos(troops[troop]);
						var targetobjectpos = GetPivotPos(troops[troop].targetobject);
						var objectxdifference = Math.abs(thistrooppos.x - targetobjectpos.x);
						var objectydifference = Math.abs(thistrooppos.y - targetobjectpos.y);
						var xvelocity = troops[troop].speed / ((objectxdifference + objectydifference) / objectxdifference);
						var yvelocity = troops[troop].speed / ((objectxdifference + objectydifference) / objectydifference);
						if (thistrooppos.x < targetobjectpos.x) troops[troop].pos[0] = troops[troop].pos[0] + (xvelocity / servertickrate);
						else if (thistrooppos.x > targetobjectpos.x) troops[troop].pos[0] = troops[troop].pos[0] - (xvelocity / servertickrate);
						if (thistrooppos.y < targetobjectpos.y) troops[troop].pos[1] = troops[troop].pos[1] + (yvelocity / servertickrate);
						else if (thistrooppos.y > targetobjectpos.y) troops[troop].pos[1] = troops[troop].pos[1] - (yvelocity / servertickrate);
						if (cards == "") cards = troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
						else cards = cards + "_" + troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
						mvtroops.push(troops[troop].id);
					}
					continue;
				}
				var detecttarget = DetectTargetTroop(troops[troop]);
				player1send = player1send + detecttarget.playerssend[0];
				player2send = player2send + detecttarget.playerssend[1];
				if (detecttarget.result == false)
				{
					if (troops[troop].cardclass == 18) continue;
					if (troops[troop].playerside == 1) troops[troop].pos[0] = troops[troop].pos[0] + (troops[troop].speed / servertickrate);
					else troops[troop].pos[0] = troops[troop].pos[0] - (troops[troop].speed / servertickrate);
					if (cards == "") cards = troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
					else cards = cards + "_" + troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
					mvtroops.push(troops[troop].id);
				}
				else if (typeof detecttarget.result == "string")
				{
					var thistrooppos = GetPivotPos(troops[troop]);
					var targetobjectpos =
					{
						x: Number(detecttarget.result.split(";")[0]),
						y: Number(detecttarget.result.split(";")[1])
					};
					var objectxdifference = Math.abs(thistrooppos.x - targetobjectpos.x);
					var objectydifference = Math.abs(thistrooppos.y - targetobjectpos.y);
					var xvelocity = troops[troop].speed / ((objectxdifference + objectydifference) / objectxdifference);
					var yvelocity = troops[troop].speed / ((objectxdifference + objectydifference) / objectydifference);
					if (thistrooppos.x < targetobjectpos.x) troops[troop].pos[0] = troops[troop].pos[0] + (xvelocity / servertickrate);
					else if (thistrooppos.x > targetobjectpos.x) troops[troop].pos[0] = troops[troop].pos[0] - (xvelocity / servertickrate);
					if (thistrooppos.y < targetobjectpos.y) troops[troop].pos[1] = troops[troop].pos[1] + (yvelocity / servertickrate);
					else if (thistrooppos.y > targetobjectpos.y) troops[troop].pos[1] = troops[troop].pos[1] - (yvelocity / servertickrate);
					if (cards == "") cards = troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
					else cards = cards + "_" + troops[troop].id + ";" + troops[troop].pos[0] + ";" + troops[troop].pos[1];
					mvtroops.push(troops[troop].id);
				}
			}
			UpdateZones(battleclass);
			if (battleclass.battleresult)
			{
				clearInterval(battleclass.productionloop);
				serverclass.playersinbattle[battleclass.player1id] = null;
				serverclass.playersinbattle[battleclass.player2id] = null;
				if (battleclass.battleresult == 1)
				{
					UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [9, "[+]"]]);
					UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [8, "[+]"]]);
				}
				else
				{
					UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[7, "[+]"], [8, "[+]"]]);
					UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[7, "[+]"], [9, "[+]"]]);
				}
				var player1newfile = filesystem.readFileSync("./accounts/" + battleclass.player1id + ".account").toString().split(";");
				var player2newfile = filesystem.readFileSync("./accounts/" + battleclass.player2id + ".account").toString().split(";");
				var player1rankupdate = Math.round((Number(battleclass.player2file[5]) + 400 * (Number(player1newfile[9]) - Number(player1newfile[8]))) / Number(player1newfile[7]));
				if (player1rankupdate < 0) player1rankupdate = 0;
				var player2rankupdate = Math.round((Number(battleclass.player1file[5]) + 400 * (Number(player2newfile[9]) - Number(player2newfile[8]))) / Number(player2newfile[7]));
				if (player2rankupdate < 0) player2rankupdate = 0;
				UpdateAccountFile("./accounts/" + battleclass.player1id + ".account", [[5, player1rankupdate]]);
				UpdateAccountFile("./accounts/" + battleclass.player2id + ".account", [[5, player2rankupdate]]);
				player1send = player1send + "result#" + battleclass.battleresult + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "!" + player1rankupdate + ";" + battleclass.player1file[5] + "&&&";
				player2send = player2send + "result#" + battleclass.battleresult + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "!" + player2rankupdate + ";" + battleclass.player2file[5] + "&&&";
				SendToPlayer(battleclass.player1id, player1send);
				SendToPlayer(battleclass.player2id, player2send);
				return;
			}
			if (cards != "")
			{
				player1send = player1send + "mvcard#" + cards + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
				player2send = player2send + "mvcard#" + cards + "!" + battleclass.player1zone + ";" + battleclass.player2zone + "&&&";
			}
			var anistopcards = "";
			for (var troop in troops)
			{
				var flag = false;
				for (var destroyedcard in destroyedcards)
				{
					if (destroyedcards[destroyedcard][1] == troops[troop])
					{
						flag = true;
						break;
					}
				}
				if (mvtroops.includes(troops[troop].id) || flag == true) continue;
				if (anistopcards == "") anistopcards = troops[troop].id;
				else anistopcards = anistopcards + ";" + troops[troop].id;
			}
			if (anistopcards != "")
			{
				player1send = player1send + "anistop#" + anistopcards + "&&&";
				player2send = player2send + "anistop#" + anistopcards + "&&&";
			}
		}
		if (player1send != "") SendToPlayer(battleclass.player1id, player1send);
		if (player2send != "") SendToPlayer(battleclass.player2id, player2send);
		BattleServerLoop(battleclass);
	}, 1000 / servertickrate, battleclass);
}
function DeleteElementFromArray(array, element)
{
	var newarray = [];
	for (var object in array)
	{
		if (array[object] != element)
		{
			newarray.push(array[object]);
		}
	}
	return newarray;
}
exports.DeleteElementFromArray = DeleteElementFromArray;
function SendToPlayer(playerid, packet, ifnot)
{
	var playerconnection;
	websocketserver.clients.forEach(function(connection) { if (connection.playerid == playerid) playerconnection = connection; });
	if (!playerconnection)
	{
		if (ifnot) ifnot();
	}
	else playerconnection.send(packet);
}
function UpdateAccountFile(file, values)
{
	var oldfile = filesystem.readFileSync(file).toString().split(";");
	var newfile = oldfile[0];
	fileloop:
	for (var i = 1; i < oldfile.length; i++)
	{
		for (var v = 0; v < values.length; v++)
		{
			if (values[v][0] == i)
			{
				if (values[v][1] == "[+]") newfile = newfile + ";" + (Number(oldfile[i]) + 1);
				else if (values[v][1] == "[-]") newfile = newfile + ";" + (Number(oldfile[i]) - 1);
				else newfile = newfile + ";" + values[v][1];
				continue fileloop;
			}
		}
		newfile = newfile + ";" + oldfile[i];
	}
	filesystem.writeFileSync(file, newfile);
}
function GetObjectValues(object)
{
	var array = [];
	for (var element in object) array.push(object[element]);
	return array;
}
function SendEconomyObjects(battleobjects, playerside)
{
	var economyobjects = 0;
	for (var object in battleobjects) if (battleobjects[object].playerside == playerside && cardsjs.economycards.includes(battleobjects[object].cardclass)) economyobjects++;
	return "ebn#" + economyobjects;
}
function SendCards()
{
	var cardsstatsresult;
	var cardstats;
	for (var card in cardsstats)
	{
		cardstats = undefined;
		for (var cardstat in cardsstats[card])
		{
			if (!cardstats) cardstats = cardsstats[card][cardstat];
			else cardstats = cardstats + ":" + cardsstats[card][cardstat];
		}
		if (!cardsstatsresult) cardsstatsresult = cardstats;
		else cardsstatsresult = cardsstatsresult + ";" + cardstats;
	}
	var economycardssend = cardsjs.economycards[0];
	for (var i = 1; i < cardsjs.economycards.length; i++) economycardssend = economycardssend + "," + cardsjs.economycards[i];
	return "gc#" + cardsstatsresult + "_" + economycardssend;
}
function DetectTargetSupport(objectclass, heal)
{
	if (!objectclass.battleclass.objects.includes(objectclass.targetobject)) objectclass.targetobject = null;
	if (heal)
	{
		if (objectclass.targetobject == null) return false;
		if (TroopInRange(objectclass, objectclass.targetobject).result == 2 && objectclass.targetobject.health / cardsstats[objectclass.targetobject.cardclass].health != 1)
		{
			if (cardsstats[objectclass.targetobject.cardclass].health - objectclass.targetobject.health > 9) objectclass.targetobject.health += 10;
			else objectclass.targetobject.health += cardsstats[objectclass.targetobject.cardclass].health - objectclass.targetobject.health;
			return ["heal#" + objectclass.id + ";" + objectclass.targetobject.id + ";" + objectclass.targetobject.health + "&&&", "heal#" + objectclass.id + ";" + objectclass.targetobject.id + ";" + objectclass.targetobject.health + "&&&"];
		}
		return false;
	}
	var playercards = [];
	var weakestcardtarget = null;
	for (var object in objectclass.battleclass.objects)
	{
		if (objectclass.battleclass.objects[object].playerside != objectclass.playerside || objectclass.battleclass.objects[object].type != 1 || objectclass.battleclass.objects[object] == objectclass) continue;
		playercards.push([objectclass.battleclass.objects[object], objectclass.battleclass.objects[object].health / cardsstats[objectclass.battleclass.objects[object].cardclass].health, TroopInRange(objectclass, objectclass.battleclass.objects[object]).distance]);
	}
	for (var card in playercards)
	{
		if (weakestcardtarget == null)
		{
			weakestcardtarget =
			{
				card: playercards[card][0],
				index: card
			};
		}
		else
		{
			if (playercards[weakestcardtarget.index][1] > playercards[card][1])
			{
				weakestcardtarget =
				{
					card: playercards[card][0],
					index: card
				};
			}
			else if (playercards[weakestcardtarget.index][1] == playercards[card][1] && ((weakestcardtarget.card.cardclass == 13 || weakestcardtarget.card.cardclass == 17) && playercards[card][0].cardclass != 13 && playercards[card][0].cardclass != 17))
			{
				weakestcardtarget =
				{
					card: playercards[card][0],
					index: card
				};
			}
			else if (playercards[weakestcardtarget.index][1] == playercards[card][1] && playercards[weakestcardtarget.index][2] > playercards[card][2] && playercards[card][0].cardclass != 13 && playercards[card][0].cardclass != 17)
			{
				weakestcardtarget =
				{
					card: playercards[card][0],
					index: card
				};
			}
		}
	}
	if (weakestcardtarget != null)
	{
		objectclass.targetobject = weakestcardtarget.card;
		if (TroopInRange(objectclass, objectclass.targetobject).result == 2) var result = false;
		else var result = ["cardtrg#" + objectclass.id + ";" + objectclass.targetobject.id + "&&&", "cardtrg#" + objectclass.id + ";" + objectclass.targetobject.id + "&&&"];
		return result;
	}
	else return false;
}
function DetectTargetTroop(objectclass)
{
	if (!objectclass.battleclass.objects.includes(objectclass.targetobject)) objectclass.targetobject = null;
	if (objectclass.targetobject != null)
	{
		if (objectclass.targetobject.type == 0) var inrangebool = BuildingInRange(objectclass, objectclass.targetobject);
		else var inrangebool = TroopInRange(objectclass, objectclass.targetobject);
		if (inrangebool.result == 1)
		{
			return {
				playerssend: ["", ""],
				result: GetPivotPos(objectclass.targetobject).x + ";" + GetPivotPos(objectclass.targetobject).y
			};
		}
		else if (inrangebool.result == 2)
		{
			return {
				playerssend: ["", ""],
				result: objectclass.targetobject
			};
		}
	}
	var opponentscardsintargetrange = [];
	var opponentscardsinrange = [];
	var opponentsclosestcardtargetrange = null;
	var opponentsclosestcardrange = null;
	for (var object in objectclass.battleclass.objects)
	{
		if (ObjectsInteractions(objectclass, objectclass.battleclass.objects[object]) == false) continue;
		if (objectclass.battleclass.objects[object].type == 0) var inrangebool = BuildingInRange(objectclass, objectclass.battleclass.objects[object]);
		else var inrangebool = TroopInRange(objectclass, objectclass.battleclass.objects[object]);
		if (inrangebool.result == 1) opponentscardsintargetrange.push([objectclass.battleclass.objects[object], inrangebool.distance]);
		else if (inrangebool.result == 2) opponentscardsinrange.push([objectclass.battleclass.objects[object], inrangebool.distance]);
	}
	for (var card in opponentscardsinrange)
	{
		if (opponentsclosestcardrange == null)
		{
			opponentsclosestcardrange =
			{
				card: opponentscardsinrange[card][0],
				index: card
			};
		}
		else
		{
			if (opponentscardsinrange[opponentsclosestcardrange.index][1] > opponentscardsinrange[card][1])
			{
				opponentsclosestcardrange =
				{
					card: opponentscardsinrange[card][0],
					index: card
				};
			}
		}
	}
	if (opponentsclosestcardrange != null)
	{
		objectclass.targetobject = opponentsclosestcardrange.card;
		return {
			playerssend: ["cardtrg#" + objectclass.id + ";" + opponentsclosestcardrange.card.id + "&&&", "cardtrg#" + objectclass.id + ";" + opponentsclosestcardrange.card.id + "&&&"],
			result: opponentsclosestcardrange.card
		};
	}
	if (opponentscardsintargetrange.length == 0)
	{
		return {
			playerssend: ["", ""],
			result: false
		};
	}
	for (var card in opponentscardsintargetrange)
	{
		if (opponentsclosestcardtargetrange == null)
		{
			opponentsclosestcardtargetrange =
			{
				card: opponentscardsintargetrange[card][0],
				index: card
			};
		}
		else
		{
			if (opponentscardsintargetrange[opponentsclosestcardtargetrange.index][1] > opponentscardsintargetrange[card][1])
			{
				opponentsclosestcardtargetrange =
				{
					card: opponentscardsintargetrange[card][0],
					index: card
				};
			}
		}
	}
	objectclass.targetobject = opponentsclosestcardtargetrange.card;
	return {
		playerssend: ["cardtrg#" + objectclass.id + ";" + opponentsclosestcardtargetrange.card.id + "&&&", "cardtrg#" + objectclass.id + ";" + opponentsclosestcardtargetrange.card.id + "&&&"],
		result: GetPivotPos(opponentsclosestcardtargetrange.card).x + ";" + GetPivotPos(opponentsclosestcardtargetrange.card).y
	};
}
function DetectTargetBuilding(objectclass)
{
	var opponentscardsinrange = [];
	var opponentsclosestcard = null;
	for (var object in objectclass.battleclass.objects)
	{
		if (ObjectsInteractions(objectclass, objectclass.battleclass.objects[object]) == false) continue;
		if (objectclass.battleclass.objects[object].type == 0) var inrangebool = BuildingInRange(objectclass, objectclass.battleclass.objects[object]);
		else var inrangebool = TroopInRange(objectclass, objectclass.battleclass.objects[object]);
		if (inrangebool.result == 2) opponentscardsinrange.push([objectclass.battleclass.objects[object], inrangebool.distance]);
	}
	for (var card in opponentscardsinrange)
	{
		if (opponentsclosestcard == null)
		{
			opponentsclosestcard =
			{
				card: opponentscardsinrange[card][0],
				index: card
			};
		}
		else
		{
			if (opponentscardsinrange[opponentsclosestcard.index][1] > opponentscardsinrange[card][1])
			{
				opponentsclosestcard =
				{
					card: opponentscardsinrange[card][0],
					index: card
				};
			}
		}
	}
	if (opponentsclosestcard != null)
	{
		objectclass.targetobject = opponentsclosestcard.card;
		return {
			playerssend: ["cardtrg#" + objectclass.id + ";" + opponentsclosestcard.card.id + "&&&", "cardtrg#" + objectclass.id + ";" + opponentsclosestcard.card.id + "&&&"],
			result: opponentsclosestcard.card
		};
	}
	else
	{
		return {
			playerssend: ["", ""],
			result: false
		};
	}
}
function CheckSupportCards(objectclass)
{
	if (objectclass.type == 0)
	{
		for (var object in objectclass.battleclass.objects)
		{
			if (objectclass.battleclass.objects[object].cardclass != 15 || objectclass.battleclass.objects[object].playerside != objectclass.playerside) continue;
			if (BuildingInRange(objectclass.battleclass.objects[object], objectclass).result == 2) return {
				result: true,
				modifier: 1.5
			};
		}
	}
	else
	{
		for (var object in objectclass.battleclass.objects)
		{
			if (objectclass.battleclass.objects[object].cardclass != 17 || objectclass.battleclass.objects[object].playerside != objectclass.playerside) continue;
			if (TroopInRange(objectclass.battleclass.objects[object], objectclass).result == 2) return {
				result: true,
				modifier: 2
			};
		}
	}
	return false;
}
function ObjectsInteractions(objectclass, targetclass)
{
	if (objectclass.playerside == targetclass.playerside) return false;
	if (targetclass.cardclass == 5) return false;
	if (objectclass.rangetype != 2 && targetclass.type == 2) return false;
	if ((objectclass.cardclass == 12 || objectclass.cardclass == 22) && targetclass.type != 0) return false;
	if (objectclass.cardclass == 9 && targetclass.type != 2) return false;
	if (objectclass.cardclass == 18 && targetclass.type == 0) return false;
	return true;
}
function CheckDestroyEvent(objectclass, destroyedcards)
{
	if (objectclass.cardclass == 20) objectclass.lastattack = Date.now() - (objectclass.attackspeed - 1) * 1000;
	if (objectclass.cardclass == 22) destroyedcards.push(["n", objectclass]);
}
function GetPivotPos(cardclass)
{
	return {
		x: cardclass.pos[0] + (cardclass.size * (100 / 32) / 2),
		y: cardclass.pos[1] + (cardclass.size * (100 / 16) / 2),
	};
}
exports.GetPivotPos = GetPivotPos;
function TroopInRange(card, troop)
{
	var rangepos = GetPivotPos(card);
	var trooppos = GetPivotPos(troop);
	var xdistance = rangepos.x / (100 / 32) - trooppos.x / (100 / 32);
	var ydistance = rangepos.y / (100 / 16) - trooppos.y / (100 / 16);
	var distance = Math.sqrt(xdistance * xdistance + ydistance * ydistance) - card.size / 2 - troop.size / 2;
	if (distance <= card.targetrange) var result = 1;
	if (distance <= card.range) var result = 2;
	if (distance > card.range && distance > card.targetrange) var result = 0;
	return {
		result: result,
		distance: distance
	}
}
function BuildingInRange(card, building)
{
	var rangepos = GetPivotPos(card);
	if (rangepos.x < building.pos[0]) var xdistance = rangepos.x - building.pos[0];
	else if (rangepos.x > building.pos[0] + building.size * (100 / 32)) var xdistance = rangepos.x - (building.pos[0] + building.size * (100 / 32));
	else var xdistance = 0;
	if (rangepos.y < building.pos[1]) var ydistance = rangepos.y - building.pos[1];
	else if (rangepos.y > building.pos[1] + building.size * (100 / 16)) var ydistance = rangepos.y - (building.pos[1] + building.size * (100 / 16));
	else var ydistance = 0;
	var distance = Math.sqrt((xdistance / (100 / 32)) * (xdistance / (100 / 32)) + (ydistance / (100 / 16)) * (ydistance / (100 / 16))) - card.size / 2;
	if (distance <= card.targetrange) var result = 1;
	if (distance <= card.range) var result = 2;
	if (distance > card.range && distance > card.targetrange) var result = 0;
	return {
		result: result,
		distance: distance
	}
}

function CheckDistance(point1, point2)
{
	var xdistance = (point1.x - point2.x) / (100 / 32);
	var ydistance = (point1.y - point2.y) / (100 / 16);
	return Math.sqrt(xdistance * xdistance + ydistance * ydistance);
}

function UpdateZones(battleclass)
{
	var farthestpos =
	{
		player1pos: null,
		player2pos: null
	}
	for (var battlecard in battleclass.objects)
	{
		if (battleclass.objects[battlecard].playerside == 1)
		{
			if (farthestpos.player1pos == null) farthestpos.player1pos = battleclass.objects[battlecard].pos[0] + battleclass.objects[battlecard].size * (100 / 32);
			else if (battleclass.objects[battlecard].pos[0] + battleclass.objects[battlecard].size * (100 / 32) > farthestpos.player1pos) farthestpos.player1pos = battleclass.objects[battlecard].pos[0] + battleclass.objects[battlecard].size * (100 / 32);
		}
		else
		{
			if (farthestpos.player2pos == null) farthestpos.player2pos = battleclass.objects[battlecard].pos[0];
			else if (battleclass.objects[battlecard].pos[0] < farthestpos.player2pos) farthestpos.player2pos = battleclass.objects[battlecard].pos[0];
		}
	}
	if (farthestpos.player1pos != null && farthestpos.player1pos > battleclass.player1zone) battleclass.player1zone = farthestpos.player1pos;
	if (farthestpos.player2pos != null && farthestpos.player2pos < 100 - battleclass.player2zone) battleclass.player2zone = 100 - farthestpos.player2pos;
	if (farthestpos.player1pos != null && farthestpos.player2pos != null)
	{
		if (farthestpos.player1pos < farthestpos.player2pos && farthestpos.player1pos > 100 - battleclass.player2zone) battleclass.player2zone = 100 - farthestpos.player1pos;
	}
	else if (farthestpos.player1pos != null && farthestpos.player1pos > 100 - battleclass.player2zone) battleclass.player2zone = 100 - farthestpos.player1pos;
	if (farthestpos.player2pos != null && farthestpos.player1pos != null)
	{
		if (farthestpos.player2pos > farthestpos.player1pos && farthestpos.player2pos < battleclass.player1zone) battleclass.player1zone = farthestpos.player2pos;
	}
	else if (farthestpos.player2pos != null && farthestpos.player2pos < battleclass.player1zone) battleclass.player1zone = farthestpos.player2pos;	
	if (battleclass.player1zone > 90.625) battleclass.player1zone = 90.625;
	if (battleclass.player1zone < 9.375) battleclass.player1zone = 9.375;
	if (battleclass.player2zone > 90.625) battleclass.player2zone = 90.625;
	if (battleclass.player2zone < 9.375) battleclass.player2zone = 9.375;
	if (farthestpos.player1pos != null && farthestpos.player1pos >= 100) battleclass.battleresult = 1;
	if (farthestpos.player2pos != null && farthestpos.player2pos <= 0) battleclass.battleresult = 2;
}