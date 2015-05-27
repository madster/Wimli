var SideScroller = SideScroller || {};

//loading the game assets
SideScroller.GameOver = function(game){};

SideScroller.GameOver.prototype = {
    create: function() {
        
        this.gameOverMusic = this.add.audio('gameOver', 1, true);
        this.gameOverMusic.play();
        this.background = this.add.sprite(SideScroller.GAME_WIDTH, SideScroller.GAME_HEIGHT,'menubackground');
        this.title = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.2, 'gameOverTitle');
        this.wimli = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.76, 'playerDead');
        this.mainMenuBtn = this.add.button(SideScroller.GAME_WIDTH*0.75, SideScroller.GAME_HEIGHT*0.5, 'mainMenuBtn', this.returnToMenu, this, 1, 0, 2);
        this.retryBtn = this.add.button(SideScroller.GAME_WIDTH*0.25, SideScroller.GAME_HEIGHT*0.5, 'retryBtn', this.startGame, this, 1, 0, 2);
        
        this.background.anchor.setTo(1, 1);
        this.title.anchor.setTo(0.5, 0.5);
        this.wimli.anchor.setTo(0.5, 0.5);
        this.retryBtn.anchor.setTo(0.5, 0.5);
        this.mainMenuBtn.anchor.setTo(0.5, 0.5);
        
    },
    startGame: function() {
        this.gameOverMusic.stop();
        this.state.start('Game', false, true);
    },
    
    returnToMenu: function() {
        this.gameOverMusic.stop();
        this.state.start('MainMenu');
    }
};