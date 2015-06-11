/*
 *    boot.js
 *    Sets up the game and adds states
 */

/* Sets a global object to hold all the states of the game */
YINS = {

	/* declare global variables, these will persist across different states */
	score: 0

}

/* Constructor creates the game object */
YINS.Boot = function() {
	YINS.game = new Phaser.Game(YINS.gameWidth, YINS.gameHeight, Phaser.CANVAS, 'game');
}
