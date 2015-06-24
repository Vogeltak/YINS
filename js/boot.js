/*
 *    boot.js
 *    Sets up game and loads preloader assets
 */

/* Sets a global object to hold all the states of the game */
YINS = {

	/* declare global variables, these will persist across different states */
	score: 0,
	sprite_scale: 2.5,

	/* Declare global colors used throughout the game 
	Usage example: YINS.color.purple  */
	color: {
	    	grey_dark: '#404040',
		purple: '#673ab7',
		purple_light: '#b39ddb',
		green_light: '#c5e1a5',
		white: '#f0f0f0'
	},

	/* Text styles are available by calling: YINS.text.STYLE 
	for example: YINS.text.header  */
	text: {
		title: {
			font: '12vh Courier New',
			fill: '#404040',
			align: 'center'
		},

		subtitle: {
			font: '3vh Courier New',
			fill: '#707070',
			align: 'center',
		},

		header: {
			font: '8vh Arial',
			fill: '#f0f0f0',
			align: 'center'
		},
		
		subheader: {
			font: '4vh Arial',
			fill: '#d0d0d0',
			align: 'center',
		},

		game: {
			font: ' 6vh Courier New',
			fill: '#f0f0f0',
			align: 'center',
		}
	}

};

/* Constructor creates the game object */
YINS.Boot = function(game) {
	console.log('%cStarting YINS..', 'color: white; background: #673ab7');
};

YINS.Boot.prototype = {
	preload: function() {
		// Load assets for the preloader state
	},

	create: function() {
		//  Phaser will automatically pause if the browser tab the game is in loses focus.
		//  true disables that; false keeps it
        YINS.game.stage.disableVisibilityChange = false;

		YINS.game.state.start('preloader');
	}
};
