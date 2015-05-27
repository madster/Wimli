var SideScroller = SideScroller || {};

//                 //
// ENEMY PROTOTYPE //
//                 //
Enemy = function (index, game, player, enemyBullets) {

    this.game = game;
    this.enemyHealth = 1; 
    this.player = player;
    this.enemyBullets = enemyBullets;
    this.fireRate = 10000; // low fire rate
    this.nextFire = 0;
    this.alive = true;
    
    // enemies shouldn't generate in the first "frame" of the game
    var min = game.canvas.width;
    var max = game.world.width;
    var x = game.rnd.between(min, max);
    // these enemies will only generate within the upper portion of the game as they are flying enemies
    var y = game.rnd.between(0, 113);
    
    // create enemy
    this.enemy = game.add.sprite(x, y, 'bunny');
    this.enemy.animations.add('walk');
    this.enemy.anchor.set(0.5, 1);
    this.enemy.name = index.toString();
    game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    //this.enemy.body.immovable = false;
    this.enemy.body.collideWorldBounds = true;
    this.enemy.body.bounce.setTo(1, 1);
    this.enemy.body.gravity.y = gravity;
};

Enemy.prototype.damage = function() {

    this.enemyHealth -= 1;

    if (this.enemyHealth <= 0) {
        this.alive = false;
        this.enemy.kill();

        return true;
    }

    return false;

}

Enemy.prototype.update = function() {
    
    //this.enemy.rotation = this.game.physics.arcade.angleBetween(this.enemy, this.player);
    //if player is on screen with enemy (canvasWidth/2 because player is anchored in the centre of the screen),
    //enemy fires towards player
    
    if (this.game.physics.arcade.distanceBetween(this.enemy, this.player) < canvasWidth/2) {
        if (this.game.time.now > this.nextFire && this.enemyBullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.enemyBullets.getFirstDead();

            bullet.reset(this.enemy.x, this.enemy.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 100);
        }
    }

};

var gravity = 1000;
var outOfBoundsHeight = 340;
var startPosX = 100;
var startPosY = 300;
var scoreLbl = null;
var score = 0;
var health = 6;
var pauseBtn;
var tween = null;
var popup;
var shooter;

var canvasWidth;
var canvasHeight;

var enemies;
var enemyBullets;
var playerBullets;
var nextFire = 0;
var fireRate = 100;
var explosions;
var cursors;

var level;
var sfxOff;

//                 //
// GAME PROTOTYPE //
//                 //

SideScroller.Game = function (level) {};

SideScroller.Game.prototype = {

    init: function(level) {
        this.level = level;
    },
    
    preload: function () {
        //if true then advanced profiling, including the fps rate, fps min/max and msMin/msMax are updated
        this.game.time.advancedTiming = true;
    },
    
    create: function () {
        console.log(this.level);
        
        if (this.level == 1) {
            this.map = this.game.add.tilemap('level1');
        }
        if (this.level == 2) {
            console.log("LEVEL 2");
            this.map = this.game.add.tilemap('level2');
        }

        //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('tiles_spritesheet', 'blockedTiles');
        this.map.addTilesetImage('blue_land', 'background');
        
        //create layers
        this.backgroundLayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        //collision with anything in blockedLayer. 
        //params = (start, stop, collides, layer, recalculate)
        this.map.setCollisionBetween(0, 5000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundLayer.resizeWorld();
        
        //create collectable items
        this.createItems();
        
        //create player
        //params = (game, startPositionX,startPositionY, key, frame)
        //this.player = this.game.add.sprite(startPosX, startPosY, 'player');
        this.player = this.game.add.sprite(startPosX, startPosY, 'playerspritesheet', 11);
        //enable physics on the player
        this.game.physics.arcade.enable(this.player);
        this.player.animations.add('walk', [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 30, false);
        this.player.animations.add('walkBack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 30, false);
        this.player.anchor.setTo(0.5, 0.5);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);
        
        //get canvas width and height for later use
        canvasWidth = this.game.canvas.width;
        canvasHeight = this.game.canvas.height;
        console.log(canvasWidth);
        console.log(canvasHeight);
        
        //create enemy
        var x = this.game.rnd.between(80, this.game.world.width);
        var y = this.game.rnd.between(0, 113);
        
        //  Point to shoot projectiles from
        // allows rotation, if this had been done on the player object, the graphic would have rotated, which we don't want
        this.shooter = this.game.add.sprite(startPosX, startPosY, 'blank');
        this.shooter.anchor.setTo(0.5, 0.5);
        
        //make a group of enemy projectiles
        enemyBullets = this.game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(100, 'bullet');

        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 0.5);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);
        
        //make a group of player projectiles
        playerBullets = this.game.add.group();
        playerBullets.enableBody = true;
        playerBullets.physicsBodyType = Phaser.Physics.ARCADE;
        playerBullets.createMultiple(100, 'peePower');

        playerBullets.setAll('anchor.x', 0.5);
        playerBullets.setAll('anchor.y', 0.5);
        playerBullets.setAll('outOfBoundsKill', true);
        playerBullets.setAll('checkWorldBounds', true);
        
        
        //create enemies
        enemies = [];
        enemiesTotal = 5; 
        for (var i = 0; i < enemiesTotal; i++) {
            enemies.push(new Enemy(i, this.game, this.player, enemyBullets));
        }
        
        

        //bring player shooting point to the top (not totally necessary)
        this.shooter.sendToBack();
        
        explosions = this.game.add.group();
        for (var i = 0; i < 10; i++)
        {
            var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('kaboom');
        }
        
        //player gravity
        this.player.body.gravity.y = gravity;
        
        //player collides with all four edges of the game world
        this.player.body.collideWorldBounds = true;
        
        //properties when the player is ducked and standing, so we can use in update()
        var playerDuckImg = this.game.cache.getImage('playerDuck');
        this.player.duckedDimensions = {
            width: playerDuckImg.width,
            height: playerDuckImg.height
        };
        this.player.standDimensions = {
            width: this.player.width,
            height: this.player.height
        };
        
        var playerJumpImg = this.game.cache.getImage('playerJump');
        this.player.jumpDimensions = {
            width: playerJumpImg.width,
            height: playerJumpImg.height
        };

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
        };
        
        //init game controller
        //this.initGameController();

        //sounds
        this.game.sound.mute = false;
        this.level1Music = this.game.add.audio('level1Music', 0.8, true);
        this.level1Music.stop();
        this.level1Music.play();
        this.poopSound = this.game.add.audio('poop', 0.8);
        this.heartSound = this.game.add.audio('heart');
        //this.waterSound = this.game.add.audio('water');
        
        this.score = this.game.add.sprite(canvasWidth * 0.86, canvasHeight * 0.08, 'score');
        this.score.anchor.setTo(0.5, 0.5);
        this.score.fixedToCamera = true;
        
        //display score at top right
        var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
        scoreLbl = this.game.add.text(canvasWidth * 0.94, canvasHeight * 0.08, "text", style);
        scoreLbl.anchor.set(0.5, 0.5);
        scoreLbl.text = score;
        scoreLbl.fixedToCamera = true;
        
        //display health at top left (starts at full health graphic)
        health1 = this.game.add.sprite(canvasWidth * 0.05, canvasHeight * 0.08, 'healthFull');
        health2 = this.game.add.sprite(canvasWidth * 0.10, canvasHeight * 0.08, 'healthFull');
        health3 = this.game.add.sprite(canvasWidth * 0.15, canvasHeight * 0.08, 'healthFull');
        
        health1.anchor.setTo(0.5, 0.5);
        health2.anchor.setTo(0.5, 0.5);
        health3.anchor.setTo(0.5, 0.5);
        
        health1.fixedToCamera = true;
        health2.fixedToCamera = true;
        health3.fixedToCamera = true; 
        
        pauseBtn = this.game.add.button(canvasWidth * 0.5, canvasHeight * 0.08, 'pauseBtn', this.managePause, this, 2, 1, 0);
        pauseBtn.input.useHandCursor = true;
        pauseBtn.fixedToCamera = true;
        
        sfxBtn = this.game.add.button(canvasWidth * 0.5, canvasHeight * 0.08, 'sfxBtn', this.sfxOnOrOff, this, 2, 1, 0);
        sfxBtn.input.useHandCursor = true;
        sfxBtn.fixedToCamera = true;
        
        //  You can drag the pop-up window around
        /*popup = this.game.add.sprite(canvasWidth * 0.5, canvasHeight * 0.5, 'pauseBackground');
        popup.alpha = 0.8;
        popup.anchor.set(0.5);
        popup.inputEnabled = true;
        popup.input.enableDrag();
        
        popup.scale.set(0);*/
    },

    //find objects in a Tiled layer that contain a property called "type" equal to a certain value
    findObjectsByType: function (type, map, layerName) {
        var result = new Array();
        map.objects[layerName].forEach(function (element) {
            if (element.properties.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust
                //also keep in mind that some images could be of different size as the tile size
                //so they might not be placed in the exact position as in Tiled
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },
    
    //create a sprite from an object
    createFromTiledObject: function (element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        //copy all properties to the sprite
        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
    },
    
    update: function () {
        //collision between player and platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer, null, null, this);
        
        //overlap between player and items
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        
       //overlap between enemy bullets and player
       this.game.physics.arcade.overlap(this.player, enemyBullets, this.bulletHitPlayer, null, this)

       //overlap between player bullets and enemy bullets
       //if player and enemy bullets hit each other, the enemy bullet is destroyed
       this.game.physics.arcade.overlap(enemyBullets, playerBullets, this.bulletHitBullet, null, this)
       
        //collision for all enemies
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {                

                //collision between player body and enemy body
                this.game.physics.arcade.collide(this.player, enemies[i].enemy, this.enemyHitPlayer, null, this);

                //overlap between player bullets and enemies
                this.game.physics.arcade.overlap(playerBullets, enemies[i].enemy, this.bulletHitEnemy, null, this);

                //collision between enemies and platforms
                this.game.physics.arcade.collide(enemies[i].enemy, this.blockedLayer, null, null, this);
                
                enemies[i].enemy.animations.play('walk', 50, true);
                
                enemies[i].update();
            }
        }
        
        this.shooter.x = this.player.x;
        this.shooter.y = this.player.y;
        
        //this.shooter's angle towards
        this.shooter.rotation = this.game.physics.arcade.angleToPointer(this.shooter, this.game.input.activePointer);
        
        //only respond to keys if the player is alive
        if (this.player.alive) {
            this.player.body.velocity.x = 0;
    
            if (this.game.input.activePointer.isDown) {
                this.fire();
            }
            if (this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.playerForward();
            }   
            if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.playerBack();
            }
            if (this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.playerJump();
            } 
            if (this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.playerDuck();
            }

            if (!this.cursors.down.isDown && this.player.isDucked && !this.pressingDown) {
                //change image and update the body size for the physics engine
                this.player.animations.play('walk');
                //this.player.loadTexture('playerDuck');
                this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
                this.player.isDucked = false;
            }
        }
            
            //if player reaches end of level, finish game (game over just now but will be changed to completeLevel)
            if (this.player.x >= this.game.world.width) {
                this.gameOver();
            }
            
            //game over if player falls off platform
            if(this.player.y > outOfBoundsHeight) {
                this.playerDead();
            }
            
        },
    
    bulletHitPlayer: function (enemy, bullet) {
        this.decreaseItem("heart");
        bullet.kill();
    },
    
    bulletHitEnemy: function (enemy, bullet) {
        bullet.kill();

        var destroyed = enemies[enemy.name].damage();

        if (destroyed) {
            //explosion when enemy gets hit by player bullet
            this.increaseItem("score");
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(enemy.x, enemy.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    },
    
    bulletHitBullet: function (bullet) {
        bullet.kill();    
        var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(bullet.x, bullet.y);
            explosionAnimation.play('kaboom', 30, false, true);
        
    },
    
    enemyHitPlayer: function () {
       this.decreaseItem("heart");
    },
    
    fire: function () {        
        if (this.game.time.now > nextFire && playerBullets.countDead() > 0){
            this.decreaseItem("water");
            nextFire = this.game.time.now + fireRate;
            
            var bullet = playerBullets.getFirstExists(false);
            bullet.reset(this.shooter.x, this.shooter.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer, 1000);
        }

    },
    
    checkPlayerHit: function (player) {
        
        //Collision with an enemy (except if player jumps on enemy head) reduces health
        //if (player.body.blocked.down) {
            console.log("Right: " + player.body.blocked.right);
            console.log("Left: " + player.body.blocked.left);
            console.log("Top: " + player.body.blocked.top);
            console.log("Bottom: " + player.body.blocked.down);
            
            /*if(player.body.blocked.left || player.body.blocked.right || player.body.blocked.up) {
            //this.enemyDead();
            console.log("Left should be blocked but... " + player.body.blocked);
            }
            else if (player.body.blocked.right) {
                //this.enemyDead();
                console.log("Right should be blocked but... " + player.body.blocked);
            }
            else if (player.body.blocked.up) {
                console.log("Up should be blocked but... " + player.body.blocked);
            }*/
        },
    
    collect: function (player, item) {
        itemType = item.sprite;
        
        if (itemType == "poop") {
            item.destroy();
            this.poopSound.play();
            this.increaseItem(itemType);
        }
        else if (itemType == "heart") {
            if (health<6)
            {
                item.destroy();
                this.increaseItem(itemType);
                this.heartSound.play();
            }   
        }
        /*else if (itemType == "water") {
            item.destroy();
            this.waterSound.play();
        }*/
        else if (itemType == "levelEnd") {
            //sound
            this.game.time.events.add(700, this.nextLevel, this);
        }
       
    },
    
    /*initGameController: function () {

        if (!GameController.hasInitiated) {
            var that = this;

            GameController.init({
               
                left: 'none',
                right: {
                    position: {right: 130, bottom: 70},
                    type: 'buttons',
                    buttons: [
                        
                        {
                            label: 'J',
                            touchStart: function () {
                                if (!that.player.alive) {
                                    return;
                                }
                                that.playerJump();
                            },
                            touchEnd: function () {
                                that.pressingDown = false;
                            }
                        },
                        false, 
                        {
                            label: 'D',
                            touchStart: function () {
                                if (!that.player.alive) {
                                    return;
                                }
                                that.pressingDown = true;
                                that.playerDuck();
                            },
                            touchEnd: function () {
                                that.pressingDown = false;
                            }
                        },
                        false
                    ]
                },
            });
            GameController.hasInitiated = true;
        }

    },*/
    
    //create collectable items
    createItems: function () {
        this.items = this.game.add.group();
        this.items.enableBody = true;
        
        this.addItemLayer('poo');
        this.addItemLayer('heart');
        //this.addItemLayer('water');
        this.addItemLayer('levelEnd');
        this.addItemLayer('levelStart');
    },
    
    addItemLayer: function (itemName) {
    var result = this.findObjectsByType(itemName, this.map, 'itemLayer');
        
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    
    gameOver: function () {
        score = 0;
        health = 6;
        this.level1Music.stop();
        this.game.state.start('GameOver');
    },

    playerForward: function () {
        this.player.body.velocity.x = 700;
        this.player.animations.play('walk');
        //this.player.loadTexture('player');
        this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        
        this.player.isMoving = true;
        //console.log("Forward height:" + this.player.standDimensions.height);
        //console.log("Forward width:" + this.player.standDimensions.width);  
    },
    
    playerBack: function () {
        this.player.animations.play('walkBack');
        this.player.body.velocity.x -= 700;
        this.player.isMoving = true;
    },
    
    playerJump: function () {
        if (this.player.body.blocked.down) {
            this.player.animations.play('walk');
            this.player.body.velocity.y -= 700;
            //console.log("Jump height:" + this.player.jumpDimensions.height);
            //console.log("Jump width:" + this.player.jumpDimensions.width);    
        }
        this.player.isJumping = true;
    },
    
    playerDuck: function () {
        //change image and update the body size for the physics engine
        this.player.loadTexture('playerDuck');
        //this.player.body.setSize(this.player.duckedDimensions.width, this.player.duckedDimensions.height);
        //console.log("Duck height:" + this.player.duckedDimensions.height);
        //console.log("Duck width:" + this.player.duckedDimensions.width);  
        //we use this to keep track whether it's ducked or not
        this.player.isDucked = true;
    },
    
    playerDead: function () {
        //set to dead (this doesn't affect rendering)
        this.player.alive = false;

        //stop moving to the right
        this.player.body.velocity.x = 0;

        //change sprite image
        this.player.loadTexture('playerDead');

        //go to gameover after a few miliseconds
        this.game.time.events.add(700, this.gameOver, this);
        
    },
    
    //this really is an awful way to do this but it works. Could do with refactoring.
    updateHealthGraphic: function (health){
    
        if (health==6) {
            health1.loadTexture('healthFull');
            health2.loadTexture('healthFull');
            health3.loadTexture('healthFull');
        }
        else if (health==5){
            health1.loadTexture("healthFull");
            health2.loadTexture("healthFull");
            health3.loadTexture("healthHalf");
        }
        else if (health==4){
            health1.loadTexture('healthFull');
            health2.loadTexture('healthFull');
            health3.loadTexture('healthEmpty');
        }
        else if (health==3){
            health1.loadTexture('healthFull');
            health2.loadTexture('healthHalf');
            health3.loadTexture('healthEmpty');
        }
        else if (health==2){
            health1.loadTexture('healthFull');
            health2.loadTexture('healthEmpty');
            health3.loadTexture('healthEmpty');
        }
        else if (health==1){
            health1.loadTexture('healthHalf');
            health2.loadTexture('healthEmpty');
            health3.loadTexture('healthEmpty');
        }
        else if (health==0){
            health1.loadTexture('healthEmpty');
            health2.loadTexture('healthEmpty');
            health3.loadTexture('healthEmpty');
            this.playerDead();
        }        
    },
    
    increaseItem: function (itemType) {
        if (itemType=="heart") {
            health+=1;
            this.updateHealthGraphic(health);
        }
        else if (itemType=="poop") {
            score+=100;
            scoreLbl.text = score;
        }
        else if (itemType=="score") {
            score+=50;
            scoreLbl.text = score;
        }
        
    },
    
    decreaseItem: function (itemType) {
        if (itemType=="heart") {
            health-=1;
            this.updateHealthGraphic(health);
        }
    },
    
    enemyMove: function () {
        this.enemy.body.velocity.x = 10;
        this.enemy.isMoving = true;
    },
    
    managePause: function() {
        this.game.paused = true;
        //var pausedText = this.add.text(100, 250, "Game paused.\nPress left arrow to continue.", this._fontStyle);
        //pausedText.fixedToCamera = true;
        this.input.onDown.add(
            function() {
                //pausedText.destroy();
                this.game.paused = false;
            }, this);
        
        //this.openWindow;
    },
    
    openWindow: function() {
        if ((tween !== null && tween.isRunning) || popup.scale.x === 1) {
        return;
        }
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        tween = game.add.tween(popup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
        
    },
    
    closeWindow: function() {
        if (tween && tween.isRunning || popup.scale.x === 0.1) {
            return;
        }

        //  Create a tween that will close the window, but only if it's not already tweening or closed
        tween = this.game.add.tween(popup.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);

        this.game.paused = false;
    },
    
    nextLevel: function() {
        level = this.level+1;
        this.game.state.start('LevelFinish', level);
    },
    
    sfxOnOrOff: function() {
        
        if(this.game.sound.mute == false) {
            this.game.sound.mute = true;
            console.log("was false now true: " + this.sfxOff)
            console.log("sfxOff = " + sfxOff)
            console.log("this.game.sound.mute = " + this.game.sound.mute)
            return;
        }
        else if(this.game.sound.mute == true) {
            this.game.sound.mute = false;
            console.log("was true now false: " + this.sfxOff)
            
            console.log("sfxOff = " + sfxOff)
            console.log("this.game.sound.mute = " + this.game.sound.mute)
            return;
        }
        //this.poopSound.pause();
        //this.heartSound.pause();
    },
    
    render: function () {

        //displays frame rate on screen
        this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        //displays player co-ordinates etc. 
        this.game.debug.bodyInfo(this.player, 0, 80);
    },

};
