var SideScroller = SideScroller || {};

var level;

//loading the game assets
SideScroller.LevelFinish = function(game, level, score){};

SideScroller.LevelFinish.prototype = {
    
    init: function(level) {
        level = this.level;
    },
    
    create: function() {
        this.background = this.add.sprite(SideScroller.GAME_WIDTH, SideScroller.GAME_HEIGHT,'menubackground');
        this.levelComplete = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.2, 'levelComplete');
        this.wimli = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.76, 'player');
        this.nextLevel = this.add.button(SideScroller.GAME_WIDTH*0.75, SideScroller.GAME_HEIGHT*0.5, 'nextBtn', this.nextLevel, this, 1, 0, 2);
        this.mainMenuBtn = this.add.button(SideScroller.GAME_WIDTH*0.25, SideScroller.GAME_HEIGHT*0.5, 'mainMenuBtn', this.returnToMenu, this, 1, 0, 2);
        
        this.background.anchor.setTo(1, 1);
        this.levelComplete.anchor.setTo(0.5, 0.5);
        this.wimli.anchor.setTo(0.5, 0.5);
        this.nextLevel.anchor.setTo(0.5, 0.5);
        this.mainMenuBtn.anchor.setTo(0.5, 0.5);
        
        //score displayed
        var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
        var scoreLbl = this.game.add.text(canvasWidth * 0.94, canvasHeight * 0.08, "text", style);
        scoreLbl.anchor.set(0.5, 0.5);
        scoreLbl.text = score;
        
    },
    nextLevel: function() {
        score = 0;
        level = level + 1;
        //Params(state, clearCache, clearGameWorld,level
        this.state.start('Level2', true, false, level)
    },
    
    returnToMenu: function() {
        this.state.start('MainMenu');
    }
};