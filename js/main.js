var SideScroller = SideScroller || {};

// Phaser.AUTO wasn't working properly so have changed to CANVAS as a temp fix
SideScroller.game = new Phaser.Game(700, 420, Phaser.AUTO, '');

SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('MainMenu', SideScroller.MainMenu);

SideScroller.game.state.add('LevelFinish', SideScroller.LevelFinish);
SideScroller.game.state.add('Game', SideScroller.Game);
SideScroller.game.state.add('GameOver', SideScroller.GameOver);

SideScroller.game.state.start('Boot');
