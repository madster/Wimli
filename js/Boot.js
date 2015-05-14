// Boot state: general game settings are defined, assets of preloading screen loaded (e.g. loading bar). Nothing sohwn to user

// if SideScroller is already defined, we use it, otherwise we initiate a new object.

var SideScroller = SideScroller || {};

SideScroller.Boot = function(){};

//setting game configuration and loading the assets for the loading screen
SideScroller.Boot.prototype = {
  
    preload: function() {
        //assets used in the loading screen
        this.load.image('preloadbar', 'assets/images/preloader-bar.png');
        //this.load.image('preloadscreen', 'assets/images/preloadscreen.png');
    },
    
  create: function() {
    //loading screen will have a blue background
    this.game.stage.backgroundColor = '#3c25b0';

    //scaling options
    //EXACT_FIT stretches the game to cover all the area
    //SHOW_ALL scales the game, keeping the aspect ratio
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally and vertically
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //screen size will be set automatically
    this.scale.setScreenSize(true);

    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  
    this.state.start('Preload');
  }
};