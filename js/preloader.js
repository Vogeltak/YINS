/*
 *    preloader.js
 *    Loads all game assets
 */

YINS.Preloader = function(game) {};

YINS.Preloader.prototype = {
	preload: function() {
		/* Visualize current state for the user */
		YINS.game.stage.backgroundColor = YINS.color.purple;
		var text = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY, "Loading...", YINS.text.header);
		text.anchor.set(0.5);
	}
};