/*
 *    mainmenu.js
 *    Handles main menu
 */

YINS.MainMenu = function(game) {
	this.music = null;
};

YINS.MainMenu.prototype = {
	create: function() {
		/* Our assets are preloaded, so here we just kick things off
		by playing some music */
		this.music = YINS.game.add.audio('menuMusic');
		this.music.loopFull(1);

		this.stage.backgroundColor = YINS.color.purple_light;

		var title = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY, "YINS", YINS.text.title);
		title.anchor.set(0.5);
	}
};