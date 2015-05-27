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
    this.load.image('menubackground', 'assets/images/menu/menubackground.png');     
    this.load.image('startBtn', 'assets/images/buttons/startBtn.png');
    this.load.image('optionsBtn', 'assets/images/buttons/optionsBtn.png'); 
    this.load.image('wimli', 'assets/images/player/startWimli.png');
    this.load.image('title', 'assets/images/text/title.png');

    this.load.audio('mainMenu', 'assets/audio/mainMenu.ogg');  
    //game assets
    //level
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('blockedTiles', 'assets/images/tiles_spritesheet.png');
    this.load.image('background', 'assets/images/blue_land.png');
    this.load.spritesheet('levelspritesheet', 'assets/images/tiles_spritesheet.png', 70, 70);

    this.load.audio('level1Music', 'assets/audio/level1.ogg');    
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
    this.load.image('water', 'assets/images/icons/water.png');
    this.load.image('score', 'assets/images/icons/trophy.png');
    this.load.image('peePower', 'assets/images/icons/peePower.png');
    this.load.image('levelStart', 'assets/images/icons/levelStart.png');
    this.load.image('levelEnd', 'assets/images/icons/levelEnd.png');

    //buttons
    this.load.image('pauseBtn', 'assets/images/buttons/pauseBtn.png'); 
    
    this.load.spritesheet('buttons', 'assets/images/buttons/btnSpritesheet.png', 35, 35, 10);

    //enemies
    this.load.image('enemyBee', 'assets/images/enemies/enemyBee.png');
    this.load.image('bullet', 'assets/images/enemies/bullet.png');
    //Params (key, location, widthPerSprite, heightPerSprite, noOfSprites)
    this.load.spritesheet('kaboom', 'assets/images/enemies/explosion.png', 64, 64, 23);
    this.load.atlasXML('bunny', 'assets/images/enemies/bunny.png', 'assets/images/enemies/bunny.xml');

    //game over
    this.load.image('gameOverTitle', 'assets/images/text/gameovertitle.png');
    this.load.image('mainMenuBtn', 'assets/images/buttons/mainMenuBtn.png');
    this.load.image('nextBtn', 'assets/images/buttons/nextBtn.png');   
    this.load.image('retryBtn', 'assets/images/buttons/retryBtn.png');  
    this.load.image('levelComplete', 'assets/images/text/levelComplete.png');  
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