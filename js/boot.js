/*
 *    boot.js
 *    Sets up game and loads preloader assets
 */

/* Sets a global object to hold all the states of the game */
YINS = {

	/* declare global variables, these will persist across different states */
	score: 0,

	/* Declare global colors used throughout the game 
	Usage example: YINS.color.purple  */
	color: {
		purple: '#673ab7'
	},

	/* Text styles are available by calling: YINS.text.STYLE 
	for example: YINS.text.header  */
	text: {
		header: {
			font: '8vh Arial',
			fill: '#f0f0f0',
			align: 'center'
		}
	}

}

/* Constructor creates the game object */
YINS.Boot = function(game) {
	console.log('%cStarting YINS..', 'color: white; background: #673ab7');
};

YINS.Boot.prototype = {
	preload: function() {
		// Load assets for the preloader state
	},

	create: function() {
		YINS.game.state.start('preloader');
	}
};
