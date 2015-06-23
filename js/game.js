/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music =  null;
	this.map = {};
	this.ground = {};
	this.health = {};
	this.controls = {};
	this.previousCoords = {};
	this.monsters = {};
};

player = {};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

		YINS.game.stage.backgroundColor = YINS.color.grey_dark;
		
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
		 *	Create monster group
		 */
		this.monsters = YINS.game.add.group();

		this.monsters.add(new Enemy());

		/* 
		 *	Add sprites to the game world 
		 */
		player = YINS.game.add.sprite(236, 4515, 'spritesheet', 19);

		// Health indication
		this.health = YINS.game.add.image(64, 64, 'spritesheet', 373);
		this.health.scale.setTo(YINS.sprite_scale);
		this.health.smoothed = false;
		this.health.fixedToCamera = true;

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
		// Set initial previous coordinates to spawn
		this.previousCoords.x = player.body.x;
		this.previousCoords.y = player.body.y;

		// Player's direction is kept track of because
		// it is needed for playing the right animations
		// 0 = left, 1 = right
		player.direction = 1;

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
		 *	Set collisions between player and tilemap 
		 */
		YINS.game.physics.arcade.collide(player, this.ground);

		/*
		 *	Set collisions between monsters and tilemap
		 */
		YINS.game.physics.arcade.collide(this.monsters, this.ground);
		
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
			}

			player.body.velocity.x = 450;
			player.play('walk');
		}
		else if (this.controls.left.isDown || this.controls.a.isDown) {
			// If the player is turned right
			// change direction to left
			if (player.direction == 1) {
				player.scale.x *= -1;
				player.direction = 0;
			}

			player.body.velocity.x = -450;
			player.play('walk');
		}
		else {
			// When there are absolutely no inputs from the user
			player.play('idle');
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

	},

	render: function() {
		YINS.game.debug.text('Sprite X: ' + player.body.x + ' Y: ' + player.body.y, 32, 32);
	},

};

/*
 *	Enemy class
 */
var Enemy = function() {
	Phaser.Sprite.call(this, YINS.game, 5015, 4090, 'spritesheet', 470);

	this.anchor.setTo(0.5, 0.5);
	this.health = 1;
	this.scale.setTo(YINS.sprite_scale);
	this.smoothed = false;
	YINS.game.physics.arcade.enable(this);

	this.direction = 0;

	this.animations.add('walk', [470, 471, 472], 8);
}

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
		if (this.direction == 0) {
			this.scale.x *= -1;
			this.direction = 1;
		}

		this.body.velocity.x = 250;
		this.play('walk');
	}
}
