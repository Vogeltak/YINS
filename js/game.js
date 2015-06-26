/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music =  {};
	this.map = {};
	this.ground = {};
	this.controls = {};
	this.previousCoords = {};
	this.monsters = {};
	this.wave = 0;
	this.bullettimer = 0;
	this.gunshot = {};
};

player = {};
health = {};
waveIsSpawned = false;
lastCollision = new Date();
text = {};
enemyCounter = {};
scoreCounter = {};
waveCounter = {};
totalEnemiesCurrentWave = 0;
monsterEmitter = {};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

		this.gunshot = YINS.game.add.audio('gunshot');

		YINS.game.stage.backgroundColor = YINS.color.grey_dark;

		/*
		 *	Set bullettimer to the current time
		 */
		this.bullettimer = YINS.game.time.now;

		/*
		 *	This text line is used for informing the player
		 *	about new waves
		 */
		text = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY - 200, ' ', YINS.text.game);
		text.anchor.setTo(0.5, 0.5);
		text.fixedToCamera = true;

		/*
		 *	Set up tilemap 
		 */
		this.map = YINS.game.add.tilemap('map');
		this.map.addTilesetImage('kenney platformer', 'spritesheet');

		this.map.setCollision([124, 153, 333, 637, 668, 737, 739, 767, 768, 831]);
		
		this.ground = this.map.createLayer('ground');
		this.ground.setScale(YINS.sprite_scale);
		this.ground.smoothed = false;
		this.ground.resizeWorld();
		YINS.game.add.existing(this.ground);

		/* 
		 *	Add sprites to the game world 
		 */
		player = YINS.game.add.sprite(236, 4515, 'spritesheet', 19);
		player.gun = YINS.game.add.sprite(236, 4515, 'spritesheet', 709);

		/*
		 *	Initialize monster particle emitter
		 */
		monsterEmitter = YINS.game.add.emitter(0, 0);
		monsterEmitter.bounce.setTo(0.5, 0.5);
		monsterEmitter.setXSpeed(-75, 75);
		monsterEmitter.setYSpeed(-50, -750);
		monsterEmitter.makeParticles('spritesheet', 78, 1000, true);
		
		/*
		 *	Create monster group
		 */
		this.monsters = YINS.game.add.group();
		this.monsters.enableBody = true;
		this.monsters.physicsBodyType = Phaser.Physics.ARCADE;
		this.monsters.setAll('checkWorldBounds', true);
		this.monsters.setAll('outOfBoundsKill', true);

		/*
		 *	Create bullet group
		 */
		player.gun.bullets = YINS.game.add.group();
		player.gun.bullets.enableBody = true;
		player.gun.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		player.gun.bullets.setAll('anchor.x', 0.5);
		player.gun.bullets.setAll('anchor.y', 0.5);
		player.gun.bullets.setAll('checkWorldBounds', true);
		player.gun.bullets.setAll('outOfBoundsKill', true);
		player.gun.bullets.setAll('scale.x', YINS.sprite_scale);
		player.gun.bullets.setAll('scale.y', YINS.sprite_scale);
		player.gun.bullets.setAll('gravity.y', 0);

		// Health indication
		health = YINS.game.add.image(64, 64, 'spritesheet', 373);
		health.scale.setTo(YINS.sprite_scale);
		health.smoothed = false;
		health.fixedToCamera = true;

		/* 
		 *	Declare animations 
		 */
		player.animations.add('idle', [19]);
		player.animations.add('walk', [19, 20, 21], 8);
		player.animations.add('down', [28]);
		player.animations.add('up', [29], 10);
		player.animations.add('duck', [22]);

		/* Enable ARCADE physics engine 
		You can read more about this in the documentation: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.html
		--> For documentation on the body property of physics enabled sprites,
		    see this article: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.Body.html */
		YINS.game.physics.startSystem(Phaser.Physics.ARCADE);

		// Enable ARCADE physics on sprites
		YINS.game.physics.enable(player, Phaser.Physics.ARCADE);

		/* Set gravity of the whole game world 
		This can be manually changed on a per sprite basis by setting
		SPRITE.body.gravity.y = GRAVITY */
		YINS.game.physics.arcade.gravity.y = 1500;

		/* 
		 *	Change properties of the player sprite 
		 */
		player.scale.setTo(YINS.sprite_scale);
		player.smoothed = false;
		player.anchor.setTo(0.5, 0.5);
		player.body.collideWorldBounds = false;
		player.health = 2;
		player.alive = true;
		// Set initial previous coordinates to spawn
		this.previousCoords.x = player.body.x;
		this.previousCoords.y = player.body.y;

		// Player's direction is kept track of because
		// it is needed for playing the right animations
		// 0 = left, 1 = right
		player.direction = 1;

		/* 
		 *	Change properties of the gun the player wields
		 */
		player.gun.scale.setTo(YINS.sprite_scale);
		player.gun.smoothed = false;
		player.gun.anchor.setTo(0.5, 0.5);

		/* 
		 *	Set controls 
		 */
		this.controls = YINS.game.input.keyboard.createCursorKeys();
		this.controls.d = YINS.game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.controls.a = YINS.game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.controls.w = YINS.game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.controls.s = YINS.game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.controls.shoot = YINS.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		/*
		 *	Initialize waveCounter
		 */
		waveCounter = YINS.game.add.text(64, 130, 'Wave: 1', YINS.text.hud);
		waveCounter.anchor.setTo(0, 0);
		waveCounter.fixedToCamera = true;

		/*
		 *	Initialize enemyCounter
		 */
		enemyCounter = YINS.game.add.text(64, 180, 'Enemies: n / n', YINS.text.hud);
		enemyCounter.anchor.setTo(0, 0);
		enemyCounter.fixedToCamera = true;

		/*
		 *	Initialize scoreCounter
		 */
		scoreCounter = YINS.game.add.text(64, 230, 'Score: 0', YINS.text.hud);
		scoreCounter.anchor.setTo(0, 0);
		scoreCounter.fixedToCamera = true;

		/* 
		 *	Camera settings 
		 */
		YINS.game.camera.follow(player);

	},

	update: function() {

		/*
		 *	Check if player is still alive,
		 *	if he/she is not, hand over to gameOver function
		 */
		if (!player.alive) {
			YINS.untilWave = this.wave;
			YINS.game.state.start('gameover');
		}

		/*
		 *	Check and update waves
		 */
		// If player killed all monsters in the group
		if (this.monsters.length === 0 && !waveIsSpawned) {
			this.wave++;
			displayText('Wave ' + this.wave + ' starts in 5 seconds', 3000);

			var monsters = this.monsters;
			var wave = this.wave;

			setTimeout(function() {
				spawnWave(monsters, wave);
			}, 5000);
			
			waveIsSpawned = true;

			waveCounter.setText('Wave: ' + this.wave);
		}
		
		/* 
		 *	Set collisions between player and tilemap 
		 */
		YINS.game.physics.arcade.collide(player, this.ground);

		/*
		 *	Set collisions between monsters and tilemap
		 */
		YINS.game.physics.arcade.collide(this.monsters, this.ground);

		/*
		 *	Set collisions between player and monsters
		 */
		YINS.game.physics.arcade.collide(player, this.monsters, this.collisionHandler);

		/*
		 *	Monsters won't just walk right through each other
		 *	Although they still can... a bit buggy
		 */
		YINS.game.physics.arcade.collide(this.monsters);
		
		/*
		 *	Set bullet collisions
		 *	for destroying bullets and hurting enemies
		 */
		YINS.game.physics.arcade.overlap(player.gun.bullets, this.monsters, this.hitMonster, null, this);

		/*
		 *	Set monster particle collision
		 */
		YINS.game.physics.arcade.collide(monsterEmitter, this.ground);
		
		/*
		 *	Set overlap for player and monster particles
		 *	so when the player picks up the particles his score will increase
		 */
		YINS.game.physics.arcade.overlap(player, monsterEmitter, function(player, coin) {
			YINS.score += 2;
			
			// Add sound effect to visualize picking up the coin
			
			coin.kill();
		});
		
		/* 
		 *	Player's velocity has to be set to 0 again,
		 *	otherwise the player would run forever when it once pressed a button 
		 */
		player.body.velocity.x = 0;

		/*
		 *	Update gun's y position
		 *	gun's x position is updated in the player update functions
		 *	because it is dependant on the player's direction
		 */
		player.gun.y = player.body.y + 32;

		/*
		 *	Check for and handle player movement
		 */
		if (this.controls.right.isDown || this.controls.d.isDown) {
			// If the player is turned left
			// change direction to right
			if (player.direction === 0 && !this.controls.shoot.isDown) {
				player.scale.x *= -1;
				player.direction = 1;
				player.gun.scale.x *= -1;
			}

			player.body.velocity.x = 450;
			player.play('walk');

			if (this.controls.shoot.isDown && player.direction === 0)
				player.gun.x = player.body.x;
			else 
				player.gun.x = player.body.x + 50;
		}
		else if (this.controls.left.isDown || this.controls.a.isDown) {
			// If the player is turned right
			// change direction to left
			if (player.direction == 1 && !this.controls.shoot.isDown) {
				player.scale.x *= -1;
				player.direction = 0;
				player.gun.scale.x *= -1;
			}

			player.body.velocity.x = -450;
			player.play('walk');

			if (this.controls.shoot.isDown && player.direction == 1)
				player.gun.x = player.body.x + 50;
			else
				player.gun.x = player.body.x;
		}
		else {
			// When there are absolutely no inputs from the user
			player.play('idle');
			if (player.direction === 0)
				player.gun.x = player.body.x;
			else
				player.gun.x = player.body.x + 50;
		}

		if ((this.controls.up.isDown || this.controls.w.isDown) && player.body.onFloor()) {
			player.body.velocity.y = -600;
		}
		
		/*
		 *	 Play the up animation while the player is still going up
		 */
		else if (!player.body.onFloor() && player.body.y < this.previousCoords.y) {
			player.play('up');
		}
		
		/*
		 *	Play the down animation while the player is falling down
		 */
		else if (!player.body.onFloor() && player.body.y > this.previousCoords.y) {
			player.play('down');
		}

		/*
		 *	When the player ducks
		 */
		if (this.controls.down.isDown || this.controls.s.isDown) {
			player.play('duck');
			player.body.velocity.y = 600;
		}

		/* 
		 *	Update player's previous coordinates 
		 */
		this.previousCoords.x = player.body.x;
		this.previousCoords.y = player.body.y;
		
		/*
		 *	If the player has fallen through the world
		 * 	set him back to spawn and decrease his health
		 */
		if (player.body.y > 5200) {
			player.body.x = 236;
			player.body.y = 4515;
			player.body.velocity.y = 0;
			player.body.velocity.x = 0;
		}
		
		/*
		 *	Fire bullets
		 */
		if (this.controls.shoot.isDown) {
			if (YINS.game.time.now > this.bullettimer) {
				this.gunshot.play('', 0, 0.5);

				var BULLET_SPEED = 1000;
				var FIRING_DELAY = 150;
				
				var bullet;

				// Player is looking to the left, 
				// so fire to the left
				if (player.direction === 0) {
					bullet = YINS.game.add.sprite(player.gun.x - 50, player.gun.y - 25, 'spritesheet', 711);
					player.gun.bullets.add(bullet);
					bullet.scale.setTo(YINS.sprite_scale);
					bullet.body.gravity.y = -1300;
					bullet.body.velocity.x = -1 * BULLET_SPEED;

					// Move player backwards a little, 
					// representing knockback of the gun
					player.body.x += 12;
				}

				// Player is looking to the right,
				// so fire to the right
				else {
					bullet = YINS.game.add.sprite(player.gun.x + 10, player.gun.y - 25, 'spritesheet', 711);
					player.gun.bullets.add(bullet);
					bullet.scale.setTo(YINS.sprite_scale);
					bullet.body.gravity.y = -1300;
					bullet.body.velocity.x = BULLET_SPEED;

					// Move player backwards a little, 
					// representing knockback of the gun
					player.body.x -= 12;
				}

				this.bullettimer = YINS.game.time.now + FIRING_DELAY;
			}
		}

		/*
		 *	Update HUD
		 */
		enemyCounter.setText('Enemies: ' + this.monsters.length + ' / ' + totalEnemiesCurrentWave);
		scoreCounter.setText('Score: ' + YINS.score);

	},

	collisionHandler: function() {
		var current = new Date();

		if ((current.getTime() - lastCollision.getTime()) > 1500) {
			if (player.health == 2) {
				player.health -= 1;
				health.loadTexture('spritesheet', 374);
				lastCollision = current;
			}
			else if (player.health == 1) {
				player.health -= 0;
				player.alive = false;
				health.loadTexture('spritesheet', 375);
			}

			player.body.velocity.y = -900;
		}
	},

	hitMonster: function(bullet, monster) {
		bullet.kill();

		// Monster dies
		if (monster.health == 1) {
			monster.health -= 1;
			monster.alive = false;

			var amountOfCoins = 2 + Math.floor(Math.random() * 5);
			
			monsterEmitter.x = monster.x;
			monsterEmitter.y = monster.y;
			monsterEmitter.start(true, 32000, 1, amountOfCoins);

			this.monsters.remove(monster, true);

			// Add one to the player's score
			YINS.score += this.wave;
		}

		// Monster stays alive but loses health from the bullet impact
		else {
			monster.health -= 1;
		}
	},

	/*
	 *	Destroy bullet when it hits ground
	 *	because these are no magic bullets
	 */
	hitGround: function(bullet, ground) {
		// FIXME: when standing on the grass layer,
		// bullets will almost immediately disappear
		bullet.kill();
	},

	/*
	 *	Handles passtrough to gameover state
	 *	and resets objects from current state
	 */
	gameOver: function() {

		YINS.game.state.start('gameover');

		// reset variables
		this.music =  null;
		this.map = {};
		this.ground = {};
		this.controls = {};
		this.previousCoords = {};
		this.monsters = {};
		this.wave = 0;
		this.bullettimer = 0;

		player = {};
		health = {};
		waveIsSpawned = false;
		lastCollision = new Date();
		text = {};
		enemyCounter = {};
		scoreCounter = {};
		waveCounter = {};
		totalEnemiesCurrentWave = 0;

	},

};

/*
 *	Enemy class
 */
var Enemy = function(monsterGroup) {
	this.monsterGroup = monsterGroup;

	Phaser.Sprite.call(this, YINS.game, 5015, 4090, 'spritesheet', 470);

	this.anchor.setTo(0.5, 0.5);
	this.health = 3;
	this.scale.setTo(YINS.sprite_scale);
	this.smoothed = false;

	this.direction = 0;

	this.animations.add('walk', [470, 471, 472], 8);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
	if (player.body.x < this.body.x) {
		if (this.direction == 1) {
			this.scale.x *= -1;
			this.direction = 0;
		}

		this.body.velocity.x = -250;
		this.play('walk');
	}
	else if (player.body.x > this.body.x) {
		if (this.direction === 0) {
			this.scale.x *= -1;
			this.direction = 1;
		}

		this.body.velocity.x = 250;
		this.play('walk');
	}

	// Removes it from the monsters group
	// when this has fallen out of the world
	// parameter 2 indicates that the object should be destroyed
	if (this.body.y > 5200) {
		this.monsterGroup.remove(this, true);
	}
};

/*
 *	====================
 *	Static functions
 *	====================
 */

/*
 *	Display a display centered text to inform the user of something
 */
function displayText(message, timeout) {
	text.setText(message);

	setTimeout(function() {
		text.setText(' ');
	}, timeout);
}

/*
 *	Spawns wave of new enemies
 *	Size is dependant on the wave iteration,
 *	then a random integer is added
 */
function spawnWave(monsterGroup, wave) {

	// Formula for the size is:
	//   size(x) = x^2 + 2x + Math.random
	// with x = wave
	var size = wave * wave + 2 * wave + Math.floor(Math.random() * 5);

	totalEnemiesCurrentWave = size;

	var spawn = setInterval(function() {
		monsterGroup.add(new Enemy(monsterGroup));
	}, 200);

	var timeout = size * 200;

	setTimeout(function() {
		clearInterval(spawn);
		waveIsSpawned = false;
	}, timeout);

}
