var SideScroller = SideScroller || {};

SideScroller.MainMenu = function(game){};

SideScroller.MainMenu.prototype = {
    create: function() {
        //background music
        this.mainMenuMusic = this.add.audio('mainMenu', 1, true);
        this.mainMenuMusic.play();
        
        this.background = this.add.sprite(SideScroller.GAME_WIDTH, SideScroller.GAME_HEIGHT,'mainMenuBackground');
        
        this.controlMenuBackground = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.5,'controlMenuBackground');
        
        this.title = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.2, 'title');
        //this.wimli = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.76, 'wimli');
        
        this.controlMenuBackground.anchor.setTo(0.5, 0.5);
        //Buttons
        //Params (leftPos, topPos, key, function when clicked, context in which to execute function, indices of images in button spritesheet) 
        //note, I don't have a spritesheet for this button. 
        this.playBtn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.45, 'playBtn', this.startLevel1, this, 1, 0, 2);
        this.levelsBtn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.60, 'levelsBtn', this.levelSubMenu, this, 1, 0, 2);
        this.controlsBtn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.75, 'controlsBtn', this.showControls, this, 1, 0, 2);
        
        this.background.anchor.setTo(1, 1);
        this.title.anchor.setTo(0.5, 0.5);
        //this.wimli.anchor.setTo(0.5, 0.5);
        this.playBtn.anchor.setTo(0.5, 0.5);
        this.controlsBtn.anchor.setTo(0.5, 0.5);
        this.levelsBtn.anchor.setTo(0.5, 0.5);
        this.playBtn.input.useHandCursor = true;
        this.controlsBtn.input.useHandCursor = true;
        this.levelsBtn.input.useHandCursor = true;
        
        // levels submenu
        this.levelMenuBackground = this.add.sprite(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.6,'levelMenuBackground');
        
        this.level1Btn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.45, 'level1Btn', this.startLevel1, this, 1, 0, 2);
        this.level2Btn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.60, 'level2Btn', this.startLevel2, this, 1, 0, 2);
        this.level3Btn = this.add.button(SideScroller.GAME_WIDTH*0.5, SideScroller.GAME_HEIGHT*0.75, 'level3Btn', this.startLevel3, this, 1, 0, 2); 
        
        this.level1Btn.anchor.setTo(0.5, 0.5);
        this.level2Btn.anchor.setTo(0.5, 0.5);
        this.level3Btn.anchor.setTo(0.5, 0.5);        
        this.level1Btn.input.useHandCursor = true;
        this.level2Btn.input.useHandCursor = true;
        this.level3Btn.input.useHandCursor = true;
        this.levelMenuBackground.anchor.setTo(0.5, 0.5);   
        
        this.closeBtn = this.add.button(SideScroller.GAME_WIDTH*0.73, SideScroller.GAME_HEIGHT*0.37, 'closeBtn', this.closeLevelSubMenu, this, 1, 0, 2);
        this.closeBtn.anchor.setTo(0.5, 0.5);        
        this.closeBtn.input.useHandCursor = true;
        
        this.levelMenuBackground.visible = false;
        this.level1Btn.visible = false;
        this.level2Btn.visible = false;
        this.level3Btn.visible = false;
        this.closeBtn.visible = false;
        
        this.controlMenuBackground.visible = false;
    },
    
    levelSubMenu: function() {
        
        this.playBtn.visible = false;
        this.levelsBtn.visible = false;
        this.controlsBtn.visible = false;
        
        this.levelMenuBackground.visible = true;
        this.level1Btn.visible = true;
        this.level2Btn.visible = true;
        this.level3Btn.visible = true;
        this.closeBtn.visible = true;
    },
    
    closeLevelSubMenu() {
    
        this.levelMenuBackground.visible = false;
        this.level1Btn.visible = false;
        this.level2Btn.visible = false;
        this.level3Btn.visible = false;
        this.closeBtn.visible = false;
        
        this.playBtn.visible = true;
        this.levelsBtn.visible = true;
        this.controlsBtn.visible = true;
    },
    
    showControls: function() {
        this.title.visible = false;
        this.playBtn.visible = false;
        this.levelsBtn.visible = false;
        this.controlsBtn.visible = false;
        
        this.controlMenuBackground.visible = true;
        this.closeBtn.visible = true;
    },
    
    closeControls: function() {
        
        this.title.visible = true;
        this.level1Btn.visible = false;
        this.level2Btn.visible = false;
        this.level3Btn.visible = false;
        this.closeBtn.visible = false;
        this.controlMenuBackground.visible = false;
        
        this.controlMenuBackground.visible = false;
        this.playBtn.visible = true;
        this.levelsBtn.visible = true;
        this.controlsBtn.visible = true;
    },
    
    startLevel1: function() {
        this.mainMenuMusic.stop();
        this.state.start('Level1');
    },
    
    startLevel2: function() {
        this.mainMenuMusic.stop();
        this.state.start('Level2');
    },
    
    startLevel3: function() {
        this.mainMenuMusic.stop();
        this.state.start('Level3');
    }
    
    
};