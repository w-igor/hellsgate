var serverjs = require("./server.js");
class Card1 //mine
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 1;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "production"][0] += 6;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "production"][0] -= 6;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "production"][0] -= 6;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
}
class Card2 //powergenerator
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 2;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "production"][1] += 8;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "production"][1] -= 8;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "production"][1] -= 8;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
}
class Card3 //soldier
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 3;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card4 //machinegun
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 4;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card5 //landmine
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 5;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.areadamage = 1.5;
		this.activationtime = Date.now() + 5000;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	explosiontargets(targettroop)
	{
		var explosiontargets = [];
		for (var object in this.battleclass.objects)
		{
			if (this.battleclass.objects[object] == targettroop) continue;
			if (this.battleclass.objects[object].playerside == this.playerside) continue;
			if (this.battleclass.objects[object].type == 0)
			{
				var targetpos = serverjs.GetPivotPos(this);
				var building = this.battleclass.objects[object];
				if (targetpos.x < building.pos[0]) var xdistance = targetpos.x - building.pos[0];
				else if (targetpos.x > building.pos[0] + building.size * (100 / 32)) var xdistance = targetpos.x - (building.pos[0] + building.size * (100 / 32));
				else var xdistance = 0;
				if (targetpos.y < building.pos[1]) var ydistance = targetpos.y - building.pos[1];
				else if (targetpos.y > building.pos[1] + building.size * (100 / 16)) var ydistance = targetpos.y - (building.pos[1] + building.size * (100 / 16));
				else var ydistance = 0;
				if (Math.sqrt((xdistance / (100 / 32)) * (xdistance / (100 / 32)) + (ydistance / (100 / 16)) * (ydistance / (100 / 16))) <= this.areadamage) explosiontargets.push(building);
			}
			else
			{
				var targetpos = serverjs.GetPivotPos(this);
				var trooppos = serverjs.GetPivotPos(this.battleclass.objects[object]);
				var xdistance = targetpos.x / (100 / 32) - trooppos.x / (100 / 32);
				var ydistance = targetpos.y / (100 / 16) - trooppos.y / (100 / 16);
				if (Math.sqrt(xdistance * xdistance + ydistance * ydistance) <= this.areadamage) explosiontargets.push(this.battleclass.objects[object]);
			}
		}
		return explosiontargets;
	}
}
class Card6 //cannonfodder
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 6;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card7 //rocketlauncher
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 7;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.areadamage = 2;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return AreaDamage(this, detecttarget);
	}
}
class Card8 //plasmacannon
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 8;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card9 //antiaircraftgun
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 9;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card10 //tank
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 10;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card11 //fighter
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 11;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card12 //bomber
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 12;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card13 //medic
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 13;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastheal = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
}
class Card14 //fortification
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 14;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
}
class Card15 //supporttower
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 15;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
}
class Card16 //bazooka
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 16;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card17 //supplyplane
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 17;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
}
class Card18 //guardian
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 18;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card19 //katyusha
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 19;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.areadamage = 1.5;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return AreaDamage(this, detecttarget);
	}
}
class Card20 //snipertower
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 20;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card21 //trenches
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 21;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = Date.now();
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][0] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	remove(playerside)
	{
		if (playerside != this.playerside) return false;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
		return true;
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
class Card22 //kamikaze
{
	constructor(battleclass, playerside, pos)
	{
		this.battleclass = battleclass;
		this.id = this.battleclass.nextobjectid;
		this.battleclass.nextobjectid++;
		this.cardclass = 22;
		this.playerside = playerside;
		this.type = serverjs.cardsstats[this.cardclass].type;
		this.health = serverjs.cardsstats[this.cardclass].health;
		this.damage = serverjs.cardsstats[this.cardclass].damage;
		this.size = serverjs.cardsstats[this.cardclass].size;
		this.speed = serverjs.cardsstats[this.cardclass].speed;
		this.attackspeed = serverjs.cardsstats[this.cardclass].attackspeed;
		this.lastattack = 0;
		this.targetobject = null;
		this.range = serverjs.cardsstats[this.cardclass].range;
		this.targetrange = serverjs.cardsstats[this.cardclass].targetrange;
		this.rangetype = serverjs.cardsstats[this.cardclass].rangetype;
		this.pos = pos;
		this.battleclass["player" + this.playerside + "resources"][1] -= serverjs.cardsstats[this.cardclass].cost;
		this.battleclass["player" + this.playerside + "productiondiminution"][0] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] += Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
	}
	destroy()
	{
		this.battleclass["player" + this.playerside + "productiondiminution"][0] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[0]);
		this.battleclass["player" + this.playerside + "productiondiminution"][1] -= Number(serverjs.cardsstats[this.cardclass].productiondiminution.split(",")[1]);
		this.battleclass.objects = serverjs.DeleteElementFromArray(this.battleclass.objects, this.battleclass.objects.find(card => card.id == this.id));
	}
	attacktargets(detecttarget)
	{
		return detecttarget;
	}
}
exports.cardsclasses =
{
	Card1: Card1,
	Card2: Card2,
	Card3: Card3,
	Card4: Card4,
	Card5: Card5,
	Card6: Card6,
	Card7: Card7,
	Card8: Card8,
	Card9: Card9,
	Card10: Card10,
	Card11: Card11,
	Card12: Card12,
	Card13: Card13,
	Card14: Card14,
	Card15: Card15,
	Card16: Card16,
	Card17: Card17,
	Card18: Card18,
	Card19: Card19,
	Card20: Card20,
	Card21: Card21,
	Card22: Card22
};
exports.economycards = [1, 2];
function AreaDamage(thisobject, detecttarget)
{
	var detecttargets = [];
	for (var object in thisobject.battleclass.objects)
	{
		if (thisobject.battleclass.objects[object].playerside == thisobject.playerside) continue;
		if (thisobject.battleclass.objects[object].type == 0)
		{
			var targetpos = serverjs.GetPivotPos(detecttarget);
			var building = thisobject.battleclass.objects[object];
			if (targetpos.x < building.pos[0]) var xdistance = targetpos.x - building.pos[0];
			else if (targetpos.x > building.pos[0] + building.size * (100 / 32)) var xdistance = targetpos.x - (building.pos[0] + building.size * (100 / 32));
			else var xdistance = 0;
			if (targetpos.y < building.pos[1]) var ydistance = targetpos.y - building.pos[1];
			else if (targetpos.y > building.pos[1] + building.size * (100 / 16)) var ydistance = targetpos.y - (building.pos[1] + building.size * (100 / 16));
			else var ydistance = 0;
			if (Math.sqrt((xdistance / (100 / 32)) * (xdistance / (100 / 32)) + (ydistance / (100 / 16)) * (ydistance / (100 / 16))) <= thisobject.areadamage / 2) detecttargets.push(building);
		}
		else
		{
			var targetpos = serverjs.GetPivotPos(detecttarget);
			var trooppos = serverjs.GetPivotPos(thisobject.battleclass.objects[object]);
			var xdistance = targetpos.x / (100 / 32) - trooppos.x / (100 / 32);
			var ydistance = targetpos.y / (100 / 16) - trooppos.y / (100 / 16);
			if (Math.sqrt(xdistance * xdistance + ydistance * ydistance) <= thisobject.areadamage) detecttargets.push(thisobject.battleclass.objects[object]);
		}
	}
	return detecttargets;
}