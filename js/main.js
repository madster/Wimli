var SideScroller = SideScroller || {};

// Phaser.AUTO wasn't working properly so have changed to CANVAS as a temp fix
SideScroller.game = new Phaser.Game(700, 420, Phaser.AUTO, '');

SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('MainMenu', SideScroller.MainMenu)
SideScroller.game.state.add('Level1', SideScroller.Level1);
SideScroller.game.state.add('Level2', SideScroller.Level2);
SideScroller.game.state.add('Level3', SideScroller.Level3);
SideScroller.game.state.add('LevelFinish', SideScroller.LevelFinish);
SideScroller.game.state.add('GameOver', SideScroller.GameOver);
SideScroller.game.state.start('Boot');
