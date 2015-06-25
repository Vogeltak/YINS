/*
 *    gameover.js
 *    Inform user of its score
 */

YINS.Gameover = function(game) {
	
};

YINS.Gameover.prototype = {

	create: function() {
		YINS.game.stage.backgroundColor = YINS.color.purple;
		
		YINS.game.world.height = YINS.GAME_HEIGHT;
		YINS.game.world.width = YINS.GAME_WIDTH;
		
		var title = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY, 'You Died', YINS.text.header);
		title.anchor.set(0.5);

		var wave = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY + 100, 'You made it until wave ' + YINS.untilWave, YINS.text.subheader);
		wave.anchor.set(0.5);
		
		var score = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY + 150, 'You scored ' + YINS.score + ' points', YINS.text.subheader);
		score.anchor.set(0.5);

		var tryagain = YINS.game.add.text(YINS.game.world.centerX, YINS.GAME_HEIGHT - 50, 'Click to try again', {'font': '3vh Courier New', 'fill': '#b0b0b0', 'align': 'center'});
		tryagain.anchor.set(0.5);

		YINS.game.input.onDown.add(this.startGame, this);
	},

	startGame: function(pointer) {
 		window.location.reload(false);
	}
	
};
