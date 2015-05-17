var SideScroller = SideScroller || {};

// Phaser.AUTO wasn't working properly so have changed to CANVAS as a temp fix
SideScroller.game = new Phaser.Game(746, 448, Phaser.CANVAS, '');

SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('Game', SideScroller.Game);

SideScroller.game.state.start('Boot');
