const log = console.log;
let player, tables, kts, aps, dts;
let food, burntFood;

let speed = 2.5;
let keyHeldCount = 0;
let speedCap = 1.5;
let spdIncr = 0.3;
let slushSpd = 1;
let dtSize = 48;
let dtOffset = dtSize * 1.05;
let dtAmount = 6;

let ingredients;
let dish = [];
let inventory;
let score = 0;
let tableNum, recipe;
let spriteBoxOffset = 10;
let ovenAvailable = true;

let bell;
let no;

let recipes = [
	{
		name: 'applePie',
		ingredients: ['apple', 'dough'],
		appliance: 'oven',
		time: 400
	},
	{
		name: 'cheeseCake',
		ingredients: ['cheese', 'dough'],
		appliance: 'oven',
		time: 400
	},
	{
		name: 'cookie',
		ingredients: ['dough', 'chocolate'],
		appliance: 'oven',
		time: 200
	},
	{
		name: 'bread',
		ingredients: ['dough'],
		appliance: 'oven',
		time: 200
	},
	{
		name: 'boiledShrimp',
		ingredients: ['shrimp'],
		appliance: 'stove',
		time: 200
	},
	{
		name: 'grilledSalmon',
		ingredients: ['salmon'],
		appliance: 'stove',
		time: 200
	},
	{
		name: 'roastedHam',
		ingredients: ['pig'],
		appliance: 'oven',
		time: 400
	}
];

// keys are the item name, values are the cooking time
let cooking = {};

function oven() {
	// only cook something in the oven if it's available
	if (ovenAvailable) {
		for (let recipe of recipes) {
			if (recipe.appliance != 'oven') continue; // skip!

			// check if the player has the ingredients to make the item
			let canMakeRecipe = true;
			for (let item of recipe.ingredients) {
				if (!dish.includes(item)) {
					canMakeRecipe = false;
				}
			}
			if (!canMakeRecipe) continue; // skip

			ovenAvailable = false;
			for (let item of recipe.ingredients) {
				removeItemFromInventory(item);
			}

			cooking[recipe.name] = recipe.time;
		}
	}

	if (inventory.length >= 5) return; // exit function

	// remove item from oven
	for (let item in cooking) {
		if (cooking[item] < 0) {
			ovenAvailable = true;
			if (cooking[item] < -200) {
				delete cooking[item];
				return 'burnt ' + item;
			}
			delete cooking[item];
			return item;
		}
	}
}

function removeItemFromInventory(item) {
	let i = dish.indexOf(item);
	if (i == -1) {
		no.play();
		return false;
	}
	dish.splice(i, 1);
	inventory[i].remove();
	repoInventory();
	return true;
}

function repoInventory() {
	for (let i = 0; i < inventory.length; i++) {
		inventory[i].x = i * 20 + spriteBoxOffset;
	}
}

function serveToTable(i) {
	if (i == tableNum) {
		let result = removeItemFromInventory(recipe.name);
		order.removeAll();
		if (result) {
			score++;
			nextDish();
		}
	}
}

function preload() {
	food = new Group();
	food.spriteSheet = loadImage('img/food0.png');
	food.tileSize = 16;
	let atlas = {
		apple: [4, 1],
		applePie: [4, 4],
		bread: [2, 3],
		cheese: [0, 3],
		cheeseCake: [5, 4],
		chocolate: [1, 0],
		cookie: [0, 0],
		dough: [5, 0],
		pig: [1, 1],
		roastedHam: [1, 5],
		salmon: [7, 2],
		grilledSalmon: [2, 5],
		shrimp: [2, 7],
		boiledShrimp: [7, 7]
	};
	food.addAnis(atlas);
	food.collider = 'none';

	burntFood = new Group();
	burntFood.spriteSheet = loadImage('img/food1.png');
	burntFood.tileSize = 16;
	burntFood.addAnis(atlas);
	burntFood.collider = 'none';

	order = new Group();

	bell = loadSound('sounds/bell.wav');
	no = loadSound('sounds/Laser_Shoot.wav');
}

function setup() {
	createCanvas(360, 202);
	noSmooth();

	tableColliders = new Group();
	tableColliders.collider = 'static';

	tables = new Group();
	tables.collider = 'static';

	tableColliders.overlap(tables);

	garbage = new tables.Sprite(10, 90, 24);
	new tableColliders.Sprite(10, 90, 12);

	// kitchen tables with ingredients
	kts = new tables.Group();
	// appliances (like ovens)
	aps = new tables.Group();

	// x, y, w, h
	new kts.Sprite(88, 26, 30, 40);
	new kts.Sprite(88, 88, 57, 35);
	new kts.Sprite(160, 28, 50, 40);
	new kts.Sprite(150, 81, 40, 42);
	new kts.Sprite(140, 130, 40, 30);
	new kts.Sprite(80, 140, 30, 40);
	new kts.Sprite(180, 140, 20, 40);

	for (let kt of kts) {
		new tableColliders.Sprite(kt.x, kt.y, kt.w - 12, kt.h - 12);
	}

	new aps.Sprite(10, 140, 35, 40);
	new tableColliders.Sprite(10, 140, 20, 70);

	dts = new tables.Group();

	let firstX = width * 0.7;
	let firstY = dtOffset * 0.5;

	for (let i = 0; i < dtAmount; i++) {
		let x, y;

		x = firstX + ((i % 2) + (floor(i / 2) % 2) * 0.5) * dtOffset;
		y = firstY + floor(i / 2) * dtOffset;

		new dts.Sprite(x, y, dtSize);
		let dtc = new tableColliders.Sprite(x, y, dtSize * 0.6);
		dtc.text = i;
	}

	player = new Sprite(22, 22, 16);

	food.tileSize = 1;
	burntFood.tileSize = 1;

	inventory = new Group();
	ingredients = ['dough', 'chocolate', 'apple', 'cheese', 'pig', 'salmon', 'shrimp'];

	// oven
	player.overlap(aps[0]);

	player.overlap(tables);

	player.overlap(garbage);

	for (let i = 0; i < kts.length; i++) {
		new food.Sprite(ingredients[i], kts[i].x, kts[i].y);
	}

	nextDish();
}

function displayRecipe() {
	for (let i = 0; i < recipe.ingredients.length; i++) {
		let item = recipe.ingredients[i];
		order.push(new food.Sprite(item, width - i * 20 - spriteBoxOffset, 191));
	}
}

function getIngredient(i) {
	if (inventory.length < 5) {
		dish.push(ingredients[i]);
		log(dish);
		inventory.push(new food.Sprite(ingredients[i], inventory.length * 20 + spriteBoxOffset, 191));
	} else {
		no.play();
	}
}

function nextDish() {
	tableNum = round(random(0, dtAmount));
	let recipeNum = round(random(0, 6));

	let table = dts[tableNum];
	recipe = recipes[recipeNum];

	log('table: ' + tableNum);
	log('recipe: ' + recipe.name + ' ingredients: ' + recipe.ingredients + ' appliance: ' + recipe.appliance);
	displayRecipe();
}

function draw() {
	background(128);

	fill(255);
	textAlign(LEFT);
	text('Score: ' + score, 10, 20);
	text('Table: ' + tableNum, 315, 175);

	// draw inventory item boxes
	fill(100);
	for (let i = 0; i < 5; i++) {
		rect(i * 20, 180, 20, 20);
	}
	fill(255);
	for (let i = 1; i <= recipe.ingredients.length; i++) {
		rect(width - i * 20, 180, 20, 20);
	}

	stroke(0);

	// log(frameCount); // in game frames drawn
	// log(Date.now()); // real world time
	for (let item in cooking) {
		cooking[item]--;
		log(item, cooking[item]);
		if (cooking[item] == 0) {
			bell.play();
		}
	}

	let keysDown = 0;

	for (let k of ['w', 'a', 's', 'd']) {
		if (kb.pressing(k)) keysDown++;
	}
	if (keysDown > 2) keysDown = 2;

	if (kb.pressing('w')) {
		player.vel.y = (-speed - keyHeldCount) / keysDown;
		if (keysDown == 2) player.vel.y += -slushSpd;
		keyHeldCount += spdIncr;
		if (keyHeldCount > speedCap) {
			keyHeldCount = speedCap;
		}
	} else if (kb.pressing('s')) {
		player.vel.y = (speed + keyHeldCount) / keysDown;
		if (keysDown == 2) player.vel.y += slushSpd;
		keyHeldCount += spdIncr;
		if (keyHeldCount > speedCap) {
			keyHeldCount = speedCap;
		}
	} else {
		player.vel.y = 0;
	}

	if (kb.pressing('a')) {
		player.vel.x = (-speed - keyHeldCount) / keysDown;
		if (keysDown == 2) player.vel.y += -slushSpd;
		keyHeldCount += spdIncr;
		if (keyHeldCount > speedCap) {
			keyHeldCount = speedCap;
		}
	} else if (kb.pressing('d')) {
		player.vel.x = (speed + keyHeldCount) / keysDown;
		if (keysDown == 2) player.vel.y += slushSpd;
		keyHeldCount += spdIncr;
		if (keyHeldCount > speedCap) {
			keyHeldCount = speedCap;
		}
	} else {
		player.vel.x = 0;
	}

	if (kb.presses(' ')) {
		for (let i = 0; i < kts.length; i++) {
			let kt = kts[i];

			if (player.overlapping(kt)) {
				getIngredient(i);
			}
		}
		for (let i = 0; i < dts.length; i++) {
			let dt = dts[i];

			if (player.overlapping(dt)) {
				serveToTable(i);
			}
		}
		if (player.overlapping(aps[0])) {
			let foodName = oven();

			if (foodName == undefined) return;
			let group;
			if (!foodName.includes('burnt')) {
				group = food;
			} else {
				group = burntFood;
				foodName = foodName.slice(6);
				log(foodName);
			}
			let res = new group.Sprite(foodName, inventory.length * 20 + spriteBoxOffset, 192);

			dish.push(foodName);
			inventory.push(res);

			log(dish);
		}
		if (player.overlapping(garbage)) {
			dish = [];
			log(dish);
			inventory.remove();
		}
	}

	// log(player.vel.x, player.vel.y);

	if (keysDown == 0) {
		keyHeldCount = 0;
	}
}
