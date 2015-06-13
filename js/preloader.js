/*
 *    preloader.js
 *    Loads all game assets
 */

YINS.Preloader = function(game) {};

YINS.Preloader.prototype = {
	preload: function() {
		// Inform the user of the current loading state
		this.stage.backgroundColor = YINS.color.purple;
		var text = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY, "Loading...", YINS.text.header);
		text.anchor.set(0.5);

		// Load all assets needed for the game
		YINS.game.load.audio('menuMusic', ['audio/mainmenu.mp3', 'audio/mainmenu.ogg']);
		YINS.game.load.audio('gameMusic', ['audio/game.wav']);
	},

	create: function() {

	},

	update: function() {
		if (YINS.game.cache.isSoundDecoded('menuMusic')) {
			YINS.game.state.start('mainMenu');
		}
	}
};