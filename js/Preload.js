var SideScroller = SideScroller || {};

//loading the game assets
SideScroller.Preload = function(){};

SideScroller.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    //level
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('blockedTiles', 'assets/images/spritesheet_ground.png');
    this.load.image('background', 'assets/images/uncolored_plain2.png');
    this.load.image('player', 'assets/images/player.png');
    //player
    this.load.image('playerDuck', 'assets/images/player_duck.png');
    this.load.image('playerJump', 'assets/images/player_jump.png');  
    this.load.image('playerDead', 'assets/images/player_dead.png');  
    this.load.image('playerBack', 'assets/images/player_back.png');
    //items
    this.load.image('poop', 'assets/images/poop.png');
    this.load.image('heart', 'assets/images/heart.png'); 
    this.load.image('healthFull', 'assets/images/healthFull.png');    
    this.load.image('healthHalf', 'assets/images/healthHalf.png');  
    this.load.image('healthEmpty', 'assets/images/healthEmpty.png');  
    this.load.image('water', 'assets/images/water.png');
    //enemies
    this.load.image('enemy', 'assets/images/enemyBee.png');
    //audio
    this.load.audio('poop', ['assets/audio/bark.ogg', 'assets/audio/bark.mp3']);
    this.load.audio('heart', 'assets/audio/health.ogg');
    this.load.audio('water', 'assets/audio/water.ogg');  
    
  },
  create: function() {
    this.state.start('Game');
  }
};