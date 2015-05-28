var SideScroller = SideScroller || {};

//loading the game assets
SideScroller.Preload = function(){
    SideScroller.GAME_WIDTH = 700;
    SideScroller.GAME_HEIGHT = 420;

};

SideScroller.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadTitle = this.add.sprite(this.game.world.centerX, this.game.world.centerY/2, 'loading');
    this.preloadTitle.anchor.setTo(0.5, 0.5);
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);


    //main menu
    this.load.image('mainMenuBackground', 'assets/images/menu/mainMenuBackground.png');     
    this.load.image('menubackground', 'assets/images/menu/menubackground.png');     
    this.load.image('playBtn', 'assets/images/buttons/playBtn.png');
    this.load.image('levelsBtn', 'assets/images/buttons/levelsBtn.png'); 
    this.load.image('controlsBtn', 'assets/images/buttons/controlsBtn.png');    
    this.load.image('wimli', 'assets/images/player/startWimli.png');
    this.load.image('title', 'assets/images/text/title.png');
    this.load.image('level1Btn', 'assets/images/buttons/level1Btn.png');
    this.load.image('level2Btn', 'assets/images/buttons/level2Btn.png'); 
    this.load.image('level3Btn', 'assets/images/buttons/level3Btn.png');  
    this.load.image('closeBtn', 'assets/images/buttons/closeBtn.png'); 
    this.load.image('levelMenuBackground', 'assets/images/menu/levelMenuBackground.png');
    this.load.image('controlMenuBackground', 'assets/images/menu/controlMenuBackground.png');
      
    this.load.audio('mainMenu', 'assets/audio/mainMenu.ogg');  
    //game assets
    
    //level 1
    
    //Tiled tilemap
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    //blockedLayer
    this.load.image('blockedTiles', 'assets/images/level1/tiles_spritesheet.png');
    //backgroundLayer
    this.load.image('level1Background', 'assets/images/level1/blue_land.png');
    this.load.audio('level1Music', 'assets/audio/level1.ogg');    
      
    //level 2
    this.load.tilemap('level2', 'assets/tilemaps/level2.json', null, Phaser.Tilemap.TILED_JSON); 
    this.load.image('l2BlockedTiles', 'assets/images/level2/mushroomtops.png'); 
    this.load.image('l2BlockedTiles2', 'assets/images/tiles_spritesheetCLEAR.png');
    this.load.image('level2Background', 'assets/images/level2/level2bg.png');
    this.load.image('stem', 'assets/images/level2/stem.png');
    this.load.image('stemTop', 'assets/images/level2/stemTop.png');
    this.load.image('stemVine', 'assets/images/level2/stemVine.png');
    this.load.image('stemBase', 'assets/images/level2/stemBase.png');      
    this.load.image('stemCrown', 'assets/images/level2/stemCrown.png');  
    this.load.audio('level2Music', 'assets/audio/level2.ogg');  
      
    //level 3
    this.load.tilemap('level3', 'assets/tilemaps/level3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.audio('level3Music', 'assets/audio/level3.ogg');   
    this.load.image('l3BlockedTiles', 'assets/images/level3/level3spritesheet.png'); 
    this.load.image('level3Background', 'assets/images/level3/level3bg.png');
    this.load.image('l3BlockedTiles', 'assets/images/level3/level3spritesheet.png');
      
    //player
    this.load.image('player', 'assets/images/player/player.png');
    this.load.image('playerDuck', 'assets/images/player/player_duck.png');
    this.load.image('playerJump', 'assets/images/player/player_jump.png');  
    this.load.image('playerDead', 'assets/images/player/player_dead.png'); 
    this.load.image('playerBack', 'assets/images/player/player_back.png');   
    this.load.spritesheet('playerspritesheet', 'assets/images/player/bfspritesheet.png', 80, 78, 22);
    this.load.image('blank', 'assets/images/player/blank.png');
    //items
    this.load.image('poop', 'assets/images/icons/poop.png');
    this.load.image('heart', 'assets/images/icons/heart.png'); 
    this.load.image('healthFull', 'assets/images/icons/healthFull.png');    
    this.load.image('healthHalf', 'assets/images/icons/healthHalf.png');  
    this.load.image('healthEmpty', 'assets/images/icons/healthEmpty.png');  
    //this.load.image('water', 'assets/images/icons/water.png');
    this.load.image('score', 'assets/images/icons/trophy.png');
    this.load.image('peePower', 'assets/images/icons/peePower.png');
    this.load.image('levelStart', 'assets/images/icons/levelStart.png');
    this.load.image('levelEnd', 'assets/images/icons/levelEnd.png');
    

    //buttons
    this.load.spritesheet('buttons', 'assets/images/buttons/btnSpritesheet.png', 35, 35, 10);

    //enemies
    this.load.spritesheet('bee', 'assets/images/enemies/beeSpritesheet.png', 70, 66, 2);
    this.load.spritesheet('spider', 'assets/images/enemies/spiderSpritesheet.png', 72, 51, 4);
    this.load.image('bullet', 'assets/images/enemies/bullet.png');
    //Params (key, location, widthPerSprite, heightPerSprite, noOfSprites)
    this.load.spritesheet('kaboom', 'assets/images/enemies/explosion.png', 64, 64, 23);
    this.load.atlasXML('bunny', 'assets/images/enemies/bunny.png', 'assets/images/enemies/bunny.xml');

    //game over
    this.load.image('gameOverTitle', 'assets/images/text/gameovertitle.png');
    this.load.image('mainMenuBtn', 'assets/images/buttons/mainMenuBtn.png');
    this.load.image('nextBtn', 'assets/images/buttons/nextBtn.png');   
    this.load.image('retryBtn', 'assets/images/buttons/retryBtn.png');  
    this.load.image('levelCompleteTitle', 'assets/images/text/levelComplete.png');  
    this.load.audio('gameOver', 'assets/audio/gameOver.ogg');  

    //audio
    this.load.audio('poop', ['assets/audio/bark.ogg', 'assets/audio/bark.mp3']);
    this.load.audio('heart', 'assets/audio/health.ogg');
    this.load.audio('water', 'assets/audio/water.ogg');  

  },
  create: function() {
    this.state.start('MainMenu');
  }
};