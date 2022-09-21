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

let dish = [];
let inventory;
let score = 0;
let tableNum, recipe;
let spriteBoxOffset = 10;

let bell;

// i3 is cookie
let recipes = {
	cookie: [['dough', 'chocolate'], 'oven']
};

// keys are the item name, values are the cooking time
let cooking = {};

function oven() {
	for (let item in cooking) {
		if (cooking[item] < 0) {
			if (cooking[item] < -200) {
				delete cooking[item];
				return 'burnt ' + item;
			}
			delete cooking[item];
			return item;
		}
	}
	if (dish.includes('dough') && dish.includes('chocolate')) {
		// await delay(5000)
		let i = dish.indexOf('dough');
		dish.splice(i, 1);
		inventory[i].remove();
		i = dish.indexOf('chocolate');
		dish.splice(i, 1);
		inventory[i].remove();
		cooking.cookie = 200;
	}
}

function preload() {
	food = new Group();
	food.spriteSheet = loadImage('img/food0.png');
	food.tileSize = 16;
	let atlas = {
		cookie: [0, 0],
		chocolate: [1, 0],
		dough: [5, 0]
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
		new tableColliders.Sprite(x, y, dtSize * 0.6);
	}

	player = new Sprite(22, 22, 16);

	food.tileSize = 1;
	burntFood.tileSize = 1;

	inventory = new Group();
	let ingredients = ['dough', 'chocolate', 'cookie'];
	for (let i = 0; i < kts.length; i++) {
		player.overlap(kts[i], () => {
			if (dish.includes(ingredients[i]) == false) {
				dish.push(ingredients[i]);
				log(dish);
				inventory.push(new food.Sprite(ingredients[i], inventory.length * 20 + spriteBoxOffset, 191));
			}
		});
	}

	// oven
	player.overlap(aps[0], () => {
		let foodName = oven();

		if (foodName != undefined) {
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
	});

	player.overlap(tables);

	player.overlap(garbage, () => {
		dish = [];
		log(dish);
		inventory.remove();
	});

	for (let i = 0; i < kts.length; i++) {
		new food.Sprite(ingredients[i], kts[i].x, kts[i].y);
	}

	nextDish();
}

function nextDish() {
	tableNum = round(random(0, dtAmount));
	let recipeNum = round(random(0, 2));

	let table = dts[tableNum];
	recipe = recipes[recipeNum];

	log('table: ' + tableNum);
	log('recipe: ' + recipe);

	player.overlap(table, () => {
		if (dish.length == 0 || dish.length != recipe.length) return;

		dish.sort();
		log(dish);

		for (let i = 0; i < dish.length; i++) {
			if (dish[i] != recipe[i]) {
				log('wrong recipe');
				return;
			}
		}

		log('done!');
		dish = [];
		score++;
		nextDish();
	});
}

function draw() {
	background(128);

	fill(255);
	textAlign(LEFT);
	text('Score: ' + score, 10, 20);
	text('Table: ' + tableNum, 10, 40);
	text('Recipie: ' + recipe, 10, 60);

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
