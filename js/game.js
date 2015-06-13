/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music;
};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

	},

	update: function() {

	}
};