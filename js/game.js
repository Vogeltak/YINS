/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music =  null;
	this.map = {};
	this.ground = {};
	this.player = {};
	this.health = {};
	this.controls = {};
	this.previousCoords = {};
	this.slime = {};
};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

		YINS.game.stage.backgroundColor = YINS.color.grey_dark;
		
		/* Set up tilemap */
		this.map = YINS.game.add.tilemap('map');
		this.map.addTilesetImage('kenney platformer', 'spritesheet');

		this.map.setCollision([124, 153, 333, 668, 737, 739, 767, 768, 831]);
		
		this.ground = this.map.createLayer('ground');
		this.ground.setScale(YINS.sprite_scale);
		this.ground.smoothed = false;
		this.ground.resizeWorld();
		YINS.game.add.existing(this.ground);

		/* Add sprites to the game world */
		this.player = YINS.game.add.sprite(236, 4515, 'spritesheet', 19);
		this.slime = YINS.game.add.sprite(5015, 4090, 'spritesheet', 230);

		// Health indication
		this.health = YINS.game.add.image(64, 64, 'spritesheet', 373);
		this.health.scale.setTo(YINS.sprite_scale);
		this.health.smoothed = false;
		this.health.fixedToCamera = true;

		/* Declare animations */
		this.player.animations.add('idle', [19]);
		this.player.animations.add('walk', [19, 20, 21], 8);
		this.player.animations.add('down', [28]);
		this.player.animations.add('up', [29], 10);
		
		this.slime.animations.add('idle', [231, 230, 229], 6);

		/* Enable ARCADE physics engine 
		You can read more about this in the documentation: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.html
		--> For documentation on the body property of physics enabled sprites,
		    see this article: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.Body.html */
		YINS.game.physics.startSystem(Phaser.Physics.ARCADE);

		// Enable ARCADE physics on sprites
		YINS.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		YINS.game.physics.enable(this.slime, Phaser.Physics.ARCADE);

		/* Set gravity of the whole game world 
		This can be manually changed on a per sprite basis by setting
		SPRITE.body.gravity.y = GRAVITY */
		YINS.game.physics.arcade.gravity.y = 1000;

		/* Change properties of the player sprite */
		this.player.scale.setTo(YINS.sprite_scale);
		this.player.smoothed = false;
		this.player.anchor.setTo(0.5, 0.5);
		this.player.body.collideWorldBounds = true;
		// Set initial previous coordinates to spawn
		this.previousCoords.x = this.player.body.x;
		this.previousCoords.y = this.player.body.y;
		
		/* Change properties of the slime sprite */
		this.slime.scale.setTo(YINS.sprite_scale);
		this.slime.smoothed = false;
		this.slime.anchor.setTo(0.5, 0.5);
		this.slime.body.collideWorldBounds = true;

		// Player's direction is kept track of because
		// it is needed for playing the right animations
		// 0 = left, 1 = right
		this.player.direction = 1;

		// Slime's direction is kept track of because
		// it is needed for playing the right animations
		// 0 = left, 1 = right 
		this.slime.direction = 0;

		/* Set controls */
		this.controls = YINS.game.input.keyboard.createCursorKeys();
		this.controls.d = YINS.game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.controls.a = YINS.game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.controls.w = YINS.game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.controls.shoot = YINS.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		/* Camera settings */
		YINS.game.camera.follow(this.player);
		
	},

	update: function() {
		
		/* Set collisions between player and tilemap */
		YINS.game.physics.arcade.collide(this.player, this.ground);
		
		/* Set collisions between slime and tilemap */
		YINS.game.physics.arcade.collide(this.slime, this.ground);
		
		this.slime.play('idle');

		/* Player's velocity has to be set to 0 again,
		otherwise the player would run forever when it once pressed a button */
		this.player.body.velocity.x = 0;

		/*
		 *	Check for and handle player movement
		 */
		if (this.controls.right.isDown || this.controls.d.isDown) {
			// If the player is turned left
			// change direction to right
			if (this.player.direction === 0) {
				this.player.scale.x *= -1;
				this.player.direction = 1;
			}

			this.player.body.velocity.x = 450;
			this.player.play('walk');
		}
		else if (this.controls.left.isDown || this.controls.a.isDown) {
			// If the player is turned right
			// change direction to left
			if (this.player.direction == 1) {
				this.player.scale.x *= -1;
				this.player.direction = 0;
			}

			this.player.body.velocity.x = -450;
			this.player.play('walk');
		}
		else {
			// When there are absolutely no inputs from the user
			this.player.play('idle');
		}

		if ((this.controls.up.isDown || this.controls.w.isDown) && this.player.body.onFloor()) {
			this.player.body.velocity.y = -600;
		}
		
		// Play the up animation while the player is still going up
		else if (!this.player.body.onFloor() && this.player.body.y < this.previousCoords.y) {
			this.player.play('up');
		}
		
		// Play the down animation while the player is falling down
		else if (!this.player.body.onFloor() && this.player.body.y > this.previousCoords.y) {
			this.player.play('down');
		}

		/* Update player's previous coordinates */
		this.previousCoords.x = this.player.body.x;
		this.previousCoords.y = this.player.body.y;

		if (this.player.body.x < this.slime.body.x) {
			if (this.slime.direction == 1) {
				this.slime.scale.x *= -1;
				this.slime.direction = 0;
			}

			this.slime.body.velocity.x = -150;
		}
		else if (this.player.body.x > this.slime.body.x) {
			if (this.slime.direction == 0) {
				this.slime.scale.x *= -1;
				this.slime.direction = 1;
			}

			this.slime.body.velocity.x = 150;
		}

	},

	render: function() {
		YINS.game.debug.text('Sprite X: ' + this.player.body.x + ' Y: ' + this.player.body.y, 32, 64);
	}

};
