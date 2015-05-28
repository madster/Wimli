var SideScroller = SideScroller || {};

//                 //
// ENEMY PROTOTYPE //
//                 //
Enemy = function (index, game, player, enemyBullets, type) {

    this.game = game;
    this.enemyHealth = 1; 
    this.player = player;
    this.enemyBullets = enemyBullets;
    this.type = type; 
    this.fireRate = 10000; // low fire rate
    this.nextFire = 0;
    this.alive = true;
    spiderVel = [-200, 200];
    spiderVelocity = this.game.rnd.pick(spiderVel);
    // enemies shouldn't generate in the first "frame" of the game
    var min = game.canvas.width;
    var max = game.world.width;
    var x = game.rnd.between(min, max);
    // these enemies will only generate within the upper portion of the game as they are flying enemies
    var y = game.rnd.between(30, 113);
    // spiders will should generate close to the ground
    var spiderY = game.rnd.between(30, 113);
    
    if (this.type=="bunny") {    
        // create enemy
        this.enemy = game.add.sprite(x, y, 'bunny');
        this.enemy.animations.add('bunnyJump');
        this.enemy.anchor.set(0.5, 1);
        this.enemy.name = index;
        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
        this.enemy.body.collideWorldBounds = true;
        this.enemy.body.bounce.setTo(1, 1);
        this.enemy.body.gravity.y = gravity;
    }
    if (this.type=="bee") {
        // create enemy
        this.enemy2 = game.add.sprite(x, y, 'bee');
        this.enemy2.animations.add('beeFly', [0,1], false);
        this.enemy2.anchor.set(0.5, 1);
        this.enemy2.name = index.toString();
        game.physics.enable(this.enemy2, Phaser.Physics.ARCADE);
        this.enemy2.body.immovable = true;
        this.enemy2.body.collideWorldBounds = true;
        this.enemy2.body.bounce.setTo(0, 0);
        this.enemy2.body.gravity.y = 0;
    }
    if (this.type=="spider") {
        this.enemy3 = game.add.sprite(x, spiderY, 'spider');
        this.player.animations.add('spiderWalk', [0,1], 30, false);
        this.enemy3.anchor.set(0.5, 1);
        this.enemy3.name = index.toString();
        game.physics.enable(this.enemy3, Phaser.Physics.ARCADE);
        this.enemy3.body.immovable = false;
        this.enemy3.body.collideWorldBounds = true;
        this.enemy3.body.bounce.setTo(0, 0);
        this.enemy3.body.gravity.y = gravity;
        this.enemy3.body.velocity.x = spiderVelocity;
    }
};

Enemy.prototype.damage = function(type) {

    this.enemyHealth -= 1;

    if (type=="bunny") {
        if (this.enemyHealth <= 0) {
            this.alive = false;
            this.enemy.kill();
            return true;
        }
        return false;
    }
    
    if (type=="bee") {
        if (this.enemyHealth <= 0) {
            this.alive = false;
            this.enemy2.kill();
            return true;
        }
        return false
    }
    
    if (type=="spider") {
        if (this.enemyHealth <= 0) {
            this.alive = false;
            this.enemy3.kill();
            return true;
        }
        return false
    }

}

Enemy.prototype.changeDirection = function() {
    spiderVelocity = spiderVelocity * -1;
    this.enemy3.body.velocity.x = spiderVelocity;
}

Enemy.prototype.update = function() {

        if (this.type=="bee") {
            if (this.game.physics.arcade.distanceBetween(this.enemy2, this.player) < canvasWidth/2) {
                if (this.game.time.now > this.nextFire && this.enemyBullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet = this.enemyBullets.getFirstDead();

                bullet.reset(this.enemy2.x, this.enemy2.y);

                bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 100);
                }
            }
            
            
        //this.enemy3.body.velocity.x = spiderVelocity;
        }
    };

var gravity = 1000;
var outOfBoundsHeight = 340;
var startPosX = 120;
var startPosY = 50;
var scoreLbl = null;
var score = 0;
var health = 6;
var nextFire = 0;
var fireRate = 100;
var enemies, beeEnemies, spiderEnemies, enemyBullets; 
var playerBullets;
var pauseBtn;
//var tween = null;
//var popup;
var shooter;
var canvasWidth, canvasHeight;
var explosions;
var cursors;

var timer, timerEvent, text;
var seconds = 0;
var minutes = 0;
var enemyCount, bunnyTotal, spiderTotal, beeTotal;
var spiderVelocity;
var gameOver, gameOverTitle;

//                 //
// GAME PROTOTYPE //
//                 //

SideScroller.Level3 = function () {};

SideScroller.Level3.prototype = {
    
    preload: function () {
        //if true then advanced profiling, including the fps rate, fps min/max and msMin/msMax are updated
        this.game.time.advancedTiming = true;
    },
    
    create: function () {
        
        //                //    
        // LEVEL SPECIFIC //
        //                //
        this.map = this.game.add.tilemap('level3');

        //level3
       //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('tiles_spritesheetCLEAR', 'blockedTiles');
        this.map.addTilesetImage('level3spritesheet', 'l3BlockedTiles');
        this.map.addTilesetImage('level3bg', 'level3Background');
        this.map.addTilesetImage('blankLayer', 'blank');
        bunnyTotal = 4;
        beeTotal = 20;
        spiderTotal = 2;

        //create layers
        this.backgroundLayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        this.visualsLayer = this.map.createLayer('visualsLayer');
        this.blankLayer = this.map.createLayer('blankLayer');
        

        //collision with anything in blockedLayer. 
        //params = (start, stop, collides, layer, recalculate)
        this.map.setCollisionBetween(0, 5000, true, 'blockedLayer');
        this.map.setCollisionBetween(0, 5000, true, 'blankLayer');

        
        //                    //    
        // NOT LEVEL SPECIFIC //
        //                    //
        
        //resizes the game world to match the layer dimensions
        this.backgroundLayer.resizeWorld();
        
        //create collectable items
        this.createItems();
        
        //create player
        //params = (game, startPositionX,startPositionY, key, frame)
        this.player = this.game.add.sprite(startPosX, startPosY, 'playerspritesheet', 11);
        //enable physics on the player
        this.game.physics.arcade.enable(this.player);
        //add player animations
        this.player.animations.add('walkForward', [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 20, false);
        this.player.animations.add('walkBack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 20, false);
        this.player.anchor.setTo(0.5, 0.5);
        
        //  Point to shoot projectiles from
        // allows rotation, if this had been done on the player object, the graphic would have rotated, which we don't want
        this.shooter = this.game.add.sprite(startPosX, startPosY, 'blank');
        this.shooter.anchor.setTo(0.5, 0.5);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);
        
        //get canvas width and height for later use
        canvasWidth = this.game.canvas.width;
        canvasHeight = this.game.canvas.height;
        
        //create enemy
        var x = this.game.rnd.between(80, this.game.world.width);
        var y = this.game.rnd.between(0, 113);
       
        
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
        beeEnemies = [];
        spiderEnemies = [];
        // bunnies
        this.createEnemies("bunny", bunnyTotal);
        // bees              
        this.createEnemies("bee", beeTotal);
        // spiders              
        this.createEnemies("spider", spiderTotal);
        
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
        //this.game.sound.mute = false;
        this.level3Music = this.game.add.audio('level3Music', 0.5, true);
        this.level3Music.play();
        this.poopSound = this.game.add.audio('poop', 0.5);
        this.heartSound = this.game.add.audio('heart', 1);
        //this.waterSound = this.game.add.audio('water');
        this.gameOverMusic = this.add.audio('gameOver', 1, true);

        
        // HUD //
        
        //trophy sprite
        this.score = this.game.add.sprite(canvasWidth * 0.86, canvasHeight * 0.08, 'score');
        this.score.anchor.setTo(0.5, 0.5);
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
        
        quitBtn = this.game.add.button(canvasWidth * 0.02, canvasHeight * 0.90, 'buttons', this.gameOver, this, 7, 6, 7);
        quitBtn.input.useHandCursor = true;
        quitBtn.fixedToCamera = true;
        
        pauseBtn = this.game.add.button(canvasWidth * 0.09, canvasHeight * 0.90, 'buttons', this.managePause, this, 1, 0, 2);
        pauseBtn.input.useHandCursor = true;
        pauseBtn.fixedToCamera = true;
        
        sfxBtn = this.game.add.button(canvasWidth * 0.16, canvasHeight * 0.90, 'buttons', this.sfxOnOrOff, this, 8, 9, 5);
        sfxBtn.input.useHandCursor = true;
        sfxBtn.fixedToCamera = true;
        //initialised to not pressed
        sfxBtn.on = false;
        
        // Create a custom timer
        timer = this.game.time.create();
        
        // Create a delayed event 1m and 30s from now
        timerEvent = timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 0, this.endTimer, this);
        
        // Start the timer
        timer.start();
        
        //game over menu
        
        menuBackground = this.game.add.sprite(canvasWidth*0.5, canvasHeight*0.5, 'menubackground');
        menuBackground.anchor.setTo(0.5, 0.5);
        menuBackground.visible = false;
        menuBackground.fixedToCamera = true;
        gameOverTitle = this.game.add.sprite(canvasWidth*0.5, canvasHeight*0.3, 'gameOverTitle');
        gameOverTitle.anchor.setTo(0.5, 0.5);
        gameOverTitle.visible = false;
        gameOverTitle.fixedToCamera = true;
        
        wimli = this.add.sprite(canvasWidth*0.5, canvasHeight*0.70, 'player');
        wimli.anchor.setTo(0.5, 0.5);
        wimli.visible = false;
        wimli.fixedToCamera = true;
        
        wimliDead = this.add.sprite(canvasWidth*0.5, canvasHeight*0.70, 'playerDead');
        wimliDead.anchor.setTo(0.5, 0.5);
        wimliDead.visible = false;
        wimliDead.fixedToCamera = true;
        
        levelCompleteTitle = this.game.add.sprite(canvasWidth*0.5, canvasHeight*0.3, 'levelCompleteTitle');
        levelCompleteTitle.anchor.setTo(0.5, 0.5);
        levelCompleteTitle.visible = false;
        levelCompleteTitle.fixedToCamera = true;
        
        mainMenuBtn = this.add.button(canvasWidth*0.3, canvasHeight*0.5, 'mainMenuBtn', this.returnToMenu, this, 1, 0, 2);
        mainMenuBtn.width = 150;
        mainMenuBtn.height = 45;
        mainMenuBtn.anchor.setTo(0.5, 0.5);
        mainMenuBtn.visible = false;
        mainMenuBtn.fixedToCamera = true;
        mainMenuBtn.input.useHandCursor = true;
        
        retryBtn = this.add.button(canvasWidth*0.7, canvasHeight*0.5, 'retryBtn', this.startGame, this, 1, 0, 2);
        retryBtn.width = 150;
        retryBtn.height = 45;
        retryBtn.anchor.setTo(0.5, 0.5);
        retryBtn.visible = false;
        retryBtn.fixedToCamera = true;
        retryBtn.input.useHandCursor = true;
        
        nextBtn = this.add.button(canvasWidth*0.7, canvasHeight*0.5, 'nextBtn', this.nextLevel, this, 1, 0, 2);
        nextBtn.width = 150;
        nextBtn.height = 45;
        nextBtn.anchor.setTo(0.5, 0.5);
        nextBtn.visible = false;
        nextBtn.fixedToCamera = true;
        nextBtn.input.useHandCursor = true;
       
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
       this.game.physics.arcade.overlap(enemyBullets, playerBullets, this.bulletHitBullet, this.bulletHitBullet, this)
       
        //collision for bunny enemies
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {                

                //collision between player body and enemy body
                //Params (object1, object2, collideCallback, processCallback, callbackContext)
                this.game.physics.arcade.collide(this.player, enemies[i].enemy, this.enemyHitPlayer, this.spiderHitPlayer, this);
                
                //collision between player body and enemy body
                //this.game.physics.arcade.collide(this.player, enemies[i].enemy, this.enemyHitPlayer, null, this);

                //overlap between player bullets and enemies
                this.game.physics.arcade.overlap(playerBullets, enemies[i].enemy, this.bulletHitBunny, null, this);

                //collision between enemies and platforms
                this.game.physics.arcade.collide(enemies[i].enemy, this.blockedLayer, null, null, this);
                
                enemies[i].enemy.animations.play('bunnyJump', 30, true);
                
                enemies[i].update();
            }
        }
       
        //collision for bee enemies
        for (var i = 0; i < beeEnemies.length; i++) {
            if (beeEnemies[i].alive) {   
                //collision between player body and enemy body
                this.game.physics.arcade.collide(this.player, beeEnemies[i].enemy2, this.enemyHitPlayer, null, this);

                //overlap between player bullets and enemies
                this.game.physics.arcade.overlap(playerBullets, beeEnemies[i].enemy2, this.bulletHitBee, null, this);

                //collision between enemies and platforms
                this.game.physics.arcade.collide(beeEnemies[i].enemy, this.blockedLayer, null, null, this);
                
                beeEnemies[i].enemy2.animations.play('beeFly', 50, true);
                
                beeEnemies[i].update();
            }
        }
        
        //collision for spider enemies
        for (var i = 0; i < spiderEnemies.length; i++) {
            if (spiderEnemies[i].alive) {                

                //collision between player body and enemy body
                //Params (object1, object2, collideCallback, processCallback, callbackContext)
                this.game.physics.arcade.collide(this.player, spiderEnemies[i].enemy3, this.enemyHitPlayer, this.spiderHitPlayer, this);

                //overlap between player bullets and enemies
                this.game.physics.arcade.overlap(playerBullets, spiderEnemies[i].enemy3, this.bulletHitSpider, null, this);

                //collision between enemies and platforms
                this.game.physics.arcade.collide(spiderEnemies[i].enemy3, this.blockedLayer, null, null, this);
                
                //collision between enemies and end of platform
                this.game.physics.arcade.collide(spiderEnemies[i].enemy3, this.blankLayer, this.spiderChangeDirection, null, this);
                
                spiderEnemies[i].enemy3.animations.play('spiderWalk', 20, true);
                
                spiderEnemies[i].enemy3.body.x.velocity = spiderVelocity;
                
                spiderEnemies[i].update();
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
            if (this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.playerJump();
            } 
            if (this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            }
        }
            
            //game over if player falls off platform
            if(this.player.y > outOfBoundsHeight) {
                this.playerDead();
            }
          
        this.updateTimer();
        
        },
    
    bulletHitPlayer: function (enemy, bullet) {
        this.decreaseItem("heart");
        bullet.kill();
    },
    
    bulletHitBunny: function (enemy, bullet) {
        bullet.kill();
        var destroyed = enemies[enemy.name].damage("bunny");
        if (destroyed) {
            //explosion when enemy gets hit by player bullet
            this.increaseItem("score");
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(enemy.x, enemy.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    },
    
    bulletHitBee: function (enemy2, bullet) {
        bullet.kill();
        var destroyed = beeEnemies[enemy2.name].damage("bee");  
         if (destroyed) {
            //explosion when enemy gets hit by player bullet
            this.increaseItem("score");
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(enemy2.x, enemy2.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    },
    
    bulletHitSpider: function (enemy3, bullet) {
        bullet.kill();
        var destroyed = spiderEnemies[enemy3.name].damage("spider");  
         if (destroyed) {
            //explosion when enemy gets hit by player bullet
            this.increaseItem("score");
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(enemy3.x, enemy3.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    },
    
    bulletHitBullet: function (bullet) {
        bullet.kill();    
        var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(bullet.x, bullet.y);
            explosionAnimation.play('kaboom', 30, false, true);
        
    },
    
    spiderChangeDirection: function (enemy3) {  
            spiderEnemies[enemy3.name].changeDirection();  
    },
       
    
    enemyHitPlayer: function () {
       this.decreaseItem("heart");
    },
    
    spiderHitPlayer: function (player, enemy3) {
        
        if (this.player.body.blocked.up == false && this.player.body.blocked.down == false && 
            this.player.body.blocked.right == false && this.player.body.blocked.left == false) {
            
            this.player.body.velocity.y=-700;
            this.increaseItem("score");
            spiderEnemies[enemy3.name].damage("spider");  
            return false
        }
        else {
            return true;
        }
    },
    
    bunnyHitPlayer: function(player, enemy) {
        
        if (this.player.body.blocked.up == false && this.player.body.blocked.down == false && 
            this.player.body.blocked.right == false && this.player.body.blocked.left == false) {
            
            this.player.body.velocity.y=-700;
        var destroyed = bunnyEnemies[enemy.name].damage("spider");  
             if (destroyed) {
                //explosion when enemy gets hit by player bullet
                this.increaseItem("score");
                var explosionAnimation = explosions.getFirstExists(false);
                explosionAnimation.reset(enemy.x, enemy.y);
                explosionAnimation.play('kaboom', 30, false, true);
                return false;
            }
            
            /*else if(this.player.body.blocked.up == false && this.player.body.blocked.down == true && 
            this.player.body.blocked.right == false && this.player.body.blocked.left == false) {
                this.decreaseItem("heart");
            }*/
            else {
                return true;
                //this.decreaseItem("heart");
                console.log("hit else");
            }
        }
    },
    
    fire: function () {        
        if (this.game.time.now > nextFire && playerBullets.countDead() > 0){
            nextFire = this.game.time.now + fireRate;
            
            var bullet = playerBullets.getFirstExists(false);
            bullet.reset(this.shooter.x, this.shooter.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer, 1000);
        }

    },
    
    collect: function (player, item, enemy3) {
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
        else if (itemType == "levelEnd") {
            this.game.time.events.add(700, this.completeLevel, this);
        }
    },
    
    //create collectable items
    createItems: function () {
        this.items = this.game.add.group();
        this.items.enableBody = true;
        
        this.addItemLayer('poo');
        this.addItemLayer('heart');
        this.addItemLayer('levelEnd');
        this.addItemLayer('levelStart');
        
        //                //    
        // LEVEL SPECIFIC //
        //                //
    },
    
    addItemLayer: function (itemName) {
    var result = this.findObjectsByType(itemName, this.map, 'itemLayer');
        console.log("item added");
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    
    gameOver: function () {
        this.level3Music.stop();
        this.player.visible = false;
        menuBackground.visible = true;
        gameOverTitle.visible = true;
        wimliDead.visible = true;
        mainMenuBtn.visible = true;
        retryBtn.visible = true;
        this.endTimer();
        this.resetVariables();
    },
    
    completeLevel: function () {
        this.level3Music.stop();
        this.player.visible = false;
        menuBackground.visible = true;
        levelCompleteTitle.visible = true;
        wimli.visible = true;
        mainMenuBtn.visible = true;
        nextBtn.visible = true;
        this.endTimer();
        this.resetVariables();
    },
    
    resetVariables: function () {
        health = 6;
        score = 0;
    },

    playerForward: function () {
        this.player.body.velocity.x = 600;
        this.player.animations.play('walkForward');
        //this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        this.player.isMoving = true;
    },
    
    playerBack: function () {
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.play('walkBack');
        this.player.body.velocity.x -= 700;
        this.player.isMoving = true;
    },
    
    playerJump: function () {
        this.player.anchor.setTo(0.5, 0.5);
        if (this.player.body.blocked.down) {
            this.player.animations.play('walkForward');
            this.player.body.velocity.y -= 700;   
        }
        this.player.isJumping = true;
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
    
    managePause: function() {
        this.game.paused = true;
        var pausedText = this.add.text(canvasWidth/2, canvasHeight/2, "Game paused", this._fontStyle);
        pausedText.fixedToCamera = true;
        this.input.onDown.add(
            function() {
                pausedText.destroy();
                this.game.paused = false;
            }, this);
    },
    
    sfxOnOrOff: function(btn) {
        btn.on = !btn.on;
        btn.setFrames(4, (btn.on)?3:9, 3);
        btn.frame = (btn.on)?3:5;
        
        if(this.game.sound.mute == false) {
            this.game.sound.mute = true;
            return;
        }
        else if(this.game.sound.mute == true) {
            this.game.sound.mute = false;
            return;
        }
    },
    
    
    //from here: http://www.html5gamedevs.com/topic/10121-count-down-timer/?hl=timer
    updateTimer: function() {
 
        minutes = Math.floor(this.game.time.time / 60000) % 60;

        seconds = Math.floor(this.game.time.time / 1000) % 60;


        //If any of the digits becomes a single digit number, pad it with a zero
        
        if (seconds < 10)
            seconds = '0' + seconds;

        if (minutes < 10)
            minutes = '0' + minutes;

        timer.text = minutes + ':'+ seconds;
 
    },
    
    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    },
    
    endTimer: function() {
        // Stop the timer when the delayed event triggers
        timer.stop();
        //this.gameOver();
        
    },
    
    createEnemies: function (type, enemiesTotal) {
                
        if (type == "bunny") {
            for (var i = 0; i < enemiesTotal; i++) {
                enemies.push(new Enemy(i, this.game, this.player, enemyBullets, type));
            }
        }
        
        if (type == "bee") {
            for (var i = 0; i < enemiesTotal; i++) {
                beeEnemies.push(new Enemy(i, this.game, this.player, enemyBullets, type));
            }
        }
        
        if (type == "spider") {
            for (var i = 0; i < enemiesTotal; i++) {
                spiderEnemies.push(new Enemy(i, this.game, this.player, enemyBullets, type));
            }
        }     
        
    },
    
    startGame: function() {
        this.state.start('Level3');
    },
    
    returnToMenu: function() {
        this.state.start('MainMenu');
    },
    
    nextLevel: function() {
        this.state.start('MainMenu');
    },
    
    render: function () {

        //displays frame rate on screen
        //this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        //displays player co-ordinates etc. 
        //this.game.debug.bodyInfo(this.player, 0, 80);
        
        //display timer countdown
        if (timer.running) {
            this.game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), canvasWidth/2, canvasHeight*0.08, "#ff0");
        }
        else {
            this.game.debug.text("Time's up!");
        }
    }

};
