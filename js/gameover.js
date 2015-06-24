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
		
		var score = YINS.game.add.text(YINS.game.world.centerX, YINS.game.world.centerY + 100, 'You scored ' + YINS.score + ' points', YINS.text.subheader);;
		score.anchor.set(0.5);
	},
	
};
