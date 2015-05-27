var SideScroller = SideScroller || {};

//loading the game assets
SideScroller.MainMenu = function(game){};

SideScroller.MainMenu.prototype = {
    create: function() {
        this.mainMenuMusic = this.add.audio('mainMenu', 1, true);
        this.mainMenuMusic.play();
        this.background = this.add.sprite(SideScroller.GAME_WIDTH, SideScroller.GAME_HEIGHT,'menubackground');
        this.title = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.2, 'title');
        this.wimli = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.76, 'wimli');
        this.optionsBtn = this.add.button(SideScroller.GAME_WIDTH*0.75, SideScroller.GAME_HEIGHT*0.5, 'optionsBtn', this.startGame, this, 1, 0, 2);
        this.startBtn = this.add.button(SideScroller.GAME_WIDTH*0.25, SideScroller.GAME_HEIGHT*0.5, 'startBtn', this.startGame, this, 1, 0, 2);
        
        this.background.anchor.setTo(1, 1);
        this.title.anchor.setTo(0.5, 0.5);
        this.wimli.anchor.setTo(0.5, 0.5);
        this.startBtn.anchor.setTo(0.5, 0.5);
        this.optionsBtn.anchor.setTo(0.5, 0.5);
        
    },
    startGame: function() {
        this.mainMenuMusic.stop();
        this.state.start('Game', false, false, 1);
    }
};