/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music =  null;
	this.map = {};
	this.ground = {};
	this.controls = {};
	this.previousCoords = {};
	this.monsters = {};
	this.wave = 1;
	this.waveIsSpawned = false;
	this.bullettimer = 0;
	this.gunshot;
};

player = {};
health = {};
lastCollision = new Date();

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

		//var text = YINS.game.add.bitmapText(320, 320, 'kenpixel', 'Welcome in YINS', 64);
		//text.fixedToCamera = true;

		/*
		 *	Introductionary text
		 */
		//displayText('Wave 1 begins in 5 seconds', 4000);

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
		 *	Create monster group
		 */
		this.monsters = YINS.game.add.group();
		this.monsters.enableBody = true;
		this.monsters.physicsBodyType = Phaser.Physics.ARCADE;

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
		player.body.collideWorldBounds = true;
		player.health = 2;
		player.body.drag.x = 500;
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
		 *	Camera settings 
		 */
		YINS.game.camera.follow(player);

	},

	update: function() {

		/*
		 *	Update gun's y position
		 *	gun's x position is updated in the player update functions
		 *	because it is dependant on the player's direction
		 */
		player.gun.y = player.body.y + 32;

		/*
		 *	Check and update waves
		 */
		// If player killed all monsters in the group
		if (this.monsters.length === 0 && !this.waveIsSpawned) {
			this.wave++;
			displayText('Wave ' + this.wave + ' starts in 30 seconds', 5000);

			var monsters = this.monsters;
			var wave = this.wave;

			setTimeout(function() {
				spawnWave(monsters, wave);
			}, 1000);
			
			this.waveIsSpawned = true;
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
		 *	Player's velocity has to be set to 0 again,
		 *	otherwise the player would run forever when it once pressed a button 
		 */
		player.body.velocity.x = 0;

		/*
		 *	Check for and handle player movement
		 */
		if (this.controls.right.isDown || this.controls.d.isDown) {
			// If the player is turned left
			// change direction to right
			if (player.direction === 0) {
				player.scale.x *= -1;
				player.direction = 1;
				player.gun.scale.x *= -1;
			}

			player.body.velocity.x = 450;
			player.play('walk');
			player.gun.x = player.body.x + 50;
		}
		else if (this.controls.left.isDown || this.controls.a.isDown) {
			// If the player is turned right
			// change direction to left
			if (player.direction == 1) {
				player.scale.x *= -1;
				player.direction = 0;
				player.gun.scale.x *= -1;
			}

			player.body.velocity.x = -450;
			player.play('walk');
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
		 *	Fire bullets
		 */
		if (this.controls.shoot.isDown) {
			if (YINS.game.time.now > this.bullettimer) {
				this.gunshot.play('', 0, 0.5);

				var BULLET_SPEED = 1000;
				var FIRING_DELAY = 150;

				// Player is looking to the left, 
				// so fire to the left
				if (player.direction === 0) {
					var bullet = YINS.game.add.sprite(player.gun.x - 50, player.gun.y - 25, 'spritesheet', 711);
					player.gun.bullets.add(bullet);
					bullet.scale.setTo(YINS.sprite_scale);
					bullet.body.gravity.y = -1300;
					bullet.body.velocity.x = -1 * BULLET_SPEED;

					// Move player backwards a little, 
					// representing knockback of the gun
					player.body.x += 10;
				}

				// Player is looking to the right,
				// so fire to the right
				else {
					var bullet = YINS.game.add.sprite(player.gun.x + 10, player.gun.y - 25, 'spritesheet', 711);
					player.gun.bullets.add(bullet);
					bullet.scale.setTo(YINS.sprite_scale);
					bullet.body.gravity.y = -1300;
					bullet.body.velocity.x = BULLET_SPEED;

					// Move player backwards a little, 
					// representing knockback of the gun
					player.body.x -= 10;
				}

				this.bullettimer = YINS.game.time.now + FIRING_DELAY;
			}

			this.shakeGame();
		}

	},

	render: function() {
		YINS.game.debug.text('Sprite X: ' + player.body.x + ' Y: ' + player.body.y, 32, 32);
	},

	collisionHandler: function() {
		var current = new Date();

		if ((current.getTime() - lastCollision.getTime()) > 1500) {
			if (player.health == 2) {
				player.health -= 1;
				health.loadTexture('spritesheet', 374);
			}
			else if (player.health == 1) {
				player.health -= 0;
				player.alive = false;
				health.loadTexture('spritesheet', 375);
				YINS.game.state.start('gameover');
			}

			player.body.velocity.y = -900;
		}

		lastCollision = current;
	},

	hitMonster: function(bullet, monster) {
		bullet.kill();

		// Monster dies
		if (monster.health == 1) {
			monster.health -= 1;
			monster.alive = false;

			// Implement explosion on position of murdered monster

			monster.kill();
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
		bullet.kill();
	},

	shakeGame: function() {
		var rumbleSpeed = 50;
		var rumbleInterval;
		var rumbleStopTimeout;

		// In milliseconds
		var rumbleDuration = 150;

		clearInterval(rumbleInterval);
		rumbleInterval = setInterval(this.shake, rumbleSpeed, YINS.game.camera, 10, 10);
		clearInterval(rumbleStopTimeut);
        rumbleStopTimeout = setTimeout(this.stopShake, rumbleDuration, this.game.camera, rumbleInterval);
	}

};

/*
 *	Enemy class
 */
var Enemy = function() {
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
};

/*
 *	====================
 *	Static functions
 *	====================
 */

/*
 *	Display a display centered text to inform the user of something
 */
function displayText(text, timeout) {
	var intro = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY - 200, "Round 0 starts in 5 seconds", YINS.text.game);
	intro.anchor.set(0.5);
	intro.smoothed = false;
	intro.fixedToCamera = true;

	setTimeout(function() {
		intro.destroy();
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

	var spawn = setInterval(function() {
		monsterGroup.add(new Enemy());
	}, 400);

	var timeout = size * 400;

	setTimeout(function() {
		clearInterval(spawn);
	}, timeout);

	waveIsSpawned = false;

}
