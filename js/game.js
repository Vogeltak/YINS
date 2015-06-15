/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music;
	this.player;
};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

		/* Add sprites to the game world */
		this.player = YINS.game.add.sprite(YINS.game.world.centerX, YINS.game.world.centerY, 'sprites', 19);

		/* Declare animations */
		this.player.animations.add('idle', [19]);
		this.player.animations.add('walk-right', [20, 21], 12);

		/* Enable ARCADE physics engine 
		You can read more about this in the documentation: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.html
		--> For documentation on the body property of physics enabled sprites,
		    see this article: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.Body.html */
		YINS.game.physics.startSystem(Phaser.Physics.ARCADE);

		// Enable ARCADE physics on sprites
		YINS.game.physics.enable(this.player, Phaser.Physics.ARCADE);

		/* Set gravity of the whole game world 
		This can be manually changed on a per sprite basis by setting
		SPRITE.body.gravity.y = GRAVITY */
		YINS.game.physics.arcade.gravity.y = 2000;

		/* Change properties of the player sprite */
		this.player.scale.setTo(YINS.sprite_scale);
		this.player.smoothed = false;
		this.player.body.collideWorldBounds = true;

	},

	update: function() {

	}
};