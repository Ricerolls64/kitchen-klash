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
let dtAmount = 8;

let ingredients;
let dish = [];
let inventory;
let score = 0;
let tableNum, recipe;
let spriteBoxOffset = 10;
let ovenAvailable = true;

let bell;

// i3 is cookie
let recipes = {
	bread: [['dough'], 'oven'],
	cookie: [['dough', 'chocolate'], 'oven'],
	applePie: [['apple', 'dough'], 'oven'],
	cheeseCake: [['cheese', 'dough'], 'oven'],
	roastedHam: [['pig'], 'oven'],
	grilledSalmon: [['salmon'], 'stove'],
	boiledShrimp: [['shrimp'], 'stove']
};

// keys are the item name, values are the cooking time
let cooking = {};

function oven() {
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

	if (ovenAvailable == false) return;

	if (dish.includes('dough') && dish.includes('chocolate')) {
		ovenAvailable = false;
		// await delay(5000)
		removeItemFromInventory('dough');
		removeItemFromInventory('chocolate');
		cooking.cookie = 200;
	}
}

function removeItemFromInventory(item) {
	let i = dish.indexOf(item);
	dish.splice(i, 1);
	inventory[i].remove();
	repoInventory();
}

function repoInventory() {
	for (let i = 0; i < inventory.length; i++) {
		inventory[i].x = i * 20 + spriteBoxOffset;
	}
}

function serveToTable(i) {
	if (i == tableNum) {
		removeItemFromInventory('cookie');
		score++;
		nextDish();
	}
}

function preload() {
	food = new Group();
	food.spriteSheet = loadImage('img/food0.png');
	food.tileSize = 16;
	let atlas = {
		cookie: [0, 0],
		chocolate: [1, 0],
		dough: [5, 0],
		apple: [4, 1],
		applePie: [4, 4],
		cheese: [0, 3],
		cheeseCake: [5, 4],
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

	bell = loadSound('sounds/bell.wav');
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

function getIngredient(i) {
	dish.push(ingredients[i]);
	log(dish);
	inventory.push(new food.Sprite(ingredients[i], inventory.length * 20 + spriteBoxOffset, 191));
}

function nextDish() {
	tableNum = round(random(0, dtAmount));
	let recipeNum = round(random(0, 6));

	let table = dts[tableNum];
	recipe = recipes[Object.keys(recipes)[recipeNum]];

	log('table: ' + tableNum);
	log('recipe: ' + recipe);
}

function draw() {
	background(128);

	fill(255);
	textAlign(LEFT);
	text('Score: ' + score, 10, 20);
	text('Table: ' + tableNum, 10, 40);

	fill(0, 0, 0, 0);
	for (let i = 0; i < inventory.length; i++) {
		rect(i * 20, 180, 20, 20);
	}

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

	allSprites.draw();

	textAlign(CENTER);

	// for (let i = 0; i < kts.length; i++) {
	// 	let kt = kts[i];
	// 	text('kt' + i, kt.x, kt.y);
	// }

	for (let i = 0; i < dts.length; i++) {
		let dt = dts[i];
		text('dt' + i, dt.x, dt.y);
	}
}
