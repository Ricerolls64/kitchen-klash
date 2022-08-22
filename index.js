const log = console.log;
let player, tables, kts, aps, dts;

let speed = 2.5;
let keyHeldCount = 0;
let speedCap = 1.5;
let spdIncr = 0.3;
let slushSpd = 1;
let dtSize = 48;
let dtOffset = dtSize * 1.05;
let dtAmount = 8;

let dish = [];
let score = 0;
let tableNum, recipe;

// i3 is cookie
let recipes = {
	i2: [['i0', 'i1'], 'a0']
};

// keys are the item name, values are the cooking time
let cooking = {};

function oven() {
	for (let item in cooking) {
		if (cooking[item] < 0) {
			delete cooking[item];
			return item;
		}
		// TODO if it cooked for too long give them burnt item
	}
	if (dish.includes('i0') && dish.includes('i1')) {
		// await delay(5000)
		let i = dish.indexOf('i0');
		dish.splice(i, 1);
		i = dish.indexOf('i1');
		dish.splice(i, 1);
		cooking.i2 = 200;
	}
}

function preload() {
	food = new Group();
	food.spriteSheet = loadImage('food0.png');
	food.tileSize = 16;
	food.addAnis({
		cookie: [0, 0],
		chocolate: [1, 0],
		dough: [5, 0]
	});
	food.collider = 'none';
}

function setup() {
	createCanvas(360, 202);
	noSmooth();

	tableColliders = new Group();
	tableColliders.collider = 'static';

	tables = new Group();
	tables.collider = 'static';

	tableColliders.overlap(tables);

	garbage = new tables.Sprite(20, 192, 24);
	new tableColliders.Sprite(20, 192, 12);

	// kitchen tables with ingredients
	kts = new tables.Group();
	// appliances (like ovens)
	aps = new tables.Group();

	// x, y, w, h
	new kts.Sprite(88, 26, 30, 40);
	new tableColliders.Sprite(88, 26, 18, 26);

	new kts.Sprite(88, 88, 57, 35);
	new tableColliders.Sprite(88, 88, 44, 22);

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

	for (let i = 0; i < kts.length; i++) {
		player.overlap(kts[i], () => {
			if (dish.includes('i' + i) == false) {
				dish.push('i' + i);
				log(dish);
			}
		});
	}

	player.overlap(aps[0], () => {
		let result = oven();
		if (result != undefined) {
			dish.push(result);
			log(dish);
		}
	});

	player.overlap(tables);

	player.overlap(garbage, () => {
		dish = [];
		log(dish);
	});

	food.tileSize = 1;
	let ingredients = ['dough', 'chocolate'];
	for (let i = 0; i < ingredients.length; i++) {
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

	textAlign(LEFT);
	text('Score: ' + score, 10, 20);
	text('Table: ' + tableNum, 10, 40);
	text('Recipie: ' + recipe, 10, 60);

	// log(frameCount); // in game frames drawn
	// log(Date.now()); // real world time
	for (let item in cooking) {
		cooking[item]--;
		log(item, cooking[item]);
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
