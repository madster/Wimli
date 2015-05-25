var SideScroller = SideScroller || {};

//             //
// ENEMY CLASS //
//             //
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

//            //
// GAME STATE //
//            //
var gravity = 1000;
var outOfBoundsHeight = 400;
var startPosX = 100;
var startPosY = 300;
var scoreLbl = null;
var score = 0;
var health = 6;
var water = 0;
var waterLbl = null;

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

SideScroller.Game = function () {};

SideScroller.Game.prototype = {

    preload: function () {
        //if true then advanced profiling, including the fps rate, fps min/max and msMin/msMax are updated
        this.game.time.advancedTiming = true;
    },
    
    create: function () {
        this.map = this.game.add.tilemap('level1');

        //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('spritesheet_ground', 'blockedTiles');
        this.map.addTilesetImage('uncolored_plain2', 'background');
        
        //create layers
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        //collision with anything in blockedLayer. 
        //params = (start, stop, collides, layer, recalculate)
        this.map.setCollisionBetween(0, 5000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();
        
        //create collectable items
        this.createItems();
        
        //create player
        //params = (game, startPositionX,startPositionY, key, frame)
        this.player = this.game.add.sprite(startPosX, startPosY, 'player');
        
        //get canvas width and height for later use
        canvasWidth = this.game.canvas.width;
        canvasHeight = this.game.canvas.height;
        
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
        playerBullets.createMultiple(5, 'peePower');

        playerBullets.setAll('anchor.x', 0.5);
        playerBullets.setAll('anchor.y', 0.5);
        playerBullets.setAll('outOfBoundsKill', true);
        playerBullets.setAll('checkWorldBounds', true);
        
        
        //create enemies
        enemies = [];
        enemiesTotal = 20; 
        for (var i = 0; i < enemiesTotal; i++) {
            enemies.push(new Enemy(i, this.game, this.player, enemyBullets));
        }
        
        //enable physics on the player
        this.game.physics.arcade.enable(this.player);

        //bring player shooting point to the top (not totally necessary)
        this.shooter.bringToTop();
        
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
        
        this.player.anchor.setTo(0.5, 0.5);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);

        //move player with cursor keys
        cursors = this.game.input.keyboard.createCursorKeys();
        
        //init game controller
        this.initGameController();

        //sounds
        this.poopSound = this.game.add.audio('poop');
        this.heartSound = this.game.add.audio('heart');
        this.waterSound = this.game.add.audio('water');
        
        //display score at top right
        var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
        scoreLbl = this.game.add.text(canvasWidth * 0.80, canvasHeight * 0.05, "text", style);
        scoreLbl.anchor.set(0.5, 0.5);
        scoreLbl.text = "Score: " + score;
        scoreLbl.fixedToCamera = true;
        
        //display pee power count at top middle
        var style2 = { font: "30px Arial", fill: "#bb00ff", align: "center" };
        waterLbl = this.game.add.text(canvasWidth * 0.50, canvasHeight * 0.05, "text", style2);
        waterLbl.anchor.set(0.5, 0.5);
        waterLbl.text = "Pee power: " + water;
        waterLbl.fixedToCamera = true;
        
        //display health at top left (starts at full health graphic)
        this.health1 = this.game.add.sprite(canvasWidth * 0.05, canvasHeight * 0.10, 'healthFull');
        this.health2 = this.game.add.sprite(canvasWidth * 0.10, canvasHeight * 0.10, 'healthFull');
        this.health3 = this.game.add.sprite(canvasWidth * 0.15, canvasHeight * 0.10, 'healthFull');
        
        this.health1.anchor.setTo(0.5, 1);
        this.health2.anchor.setTo(0.5, 1);
        this.health3.anchor.setTo(0.5, 1);
        
        this.health1.fixedToCamera = true;
        this.health2.fixedToCamera = true;
        this.health3.fixedToCamera = true;        
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

        //collision for all enemies
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {                

                //collision between player body and enemy body
                this.game.physics.arcade.collide(this.player, enemies[i].enemy, this.bulletHitPlayer, null, this);

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
    
            //doesn't detect mouse click - currently investigating
            if (this.game.input.activePointer.isDown) {
                console.log("pointer is down");
                this.fire();
            }
            else if (cursors.right.isDown) {
                this.playerForward();
            }   
            else if (cursors.left.isDown) {
                this.playerBack();
            }
            else if (cursors.up.isDown) {
                this.playerJump();
            } 
            else if (cursors.down.isDown) {
                this.fire();
                this.playerDuck();
            }

            if (!cursors.down.isDown && this.player.isDucked && !this.pressingDown) {
                //change image and update the body size for the physics engine
                this.player.loadTexture('player');
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
    
    fire: function () {        
        console.log("fire was called");
        console.log(this.game.input.activePointer.x);
        console.log(this.game.input.activePointer.y);
        if (this.game.time.now > nextFire && water!=0 && playerBullets.countDead() > 0){
            this.decreaseItem("water");
            nextFire = this.game.time.now + fireRate;
            
            var bullet = playerBullets.getFirstExists(false);
            bullet.reset(this.shooter.x, this.shooter.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer, 1000);
            console.log(this.game.input.activePointer);
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
        else if (itemType == "water") {
            item.destroy();
            this.increaseItem(itemType);
            this.waterSound.play();
        }
       
    },
    
    initGameController: function () {

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

    },
    
    //create collectable items
    createItems: function () {
        this.items = this.game.add.group();
        this.items.enableBody = true;
        
        this.addItemLayer('poo');
        this.addItemLayer('heart');
        this.addItemLayer('water');
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
        water = 0;
        this.game.state.start('Game');
    },

    playerForward: function () {
        this.player.loadTexture('player');
        this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        this.player.body.velocity.x = 700;
        this.player.isMoving = true;
        //console.log("Forward height:" + this.player.standDimensions.height);
        //console.log("Forward width:" + this.player.standDimensions.width);  
    },
    
    playerBack: function () {
        this.player.loadTexture('playerBack');
        this.player.body.velocity.x -= 700;
        this.player.isMoving = true;
    },
    
    playerJump: function () {
        if (this.player.body.blocked.down) {
            this.player.body.velocity.y -= 700;
            this.player.loadTexture('playerJump');
            //console.log("Jump height:" + this.player.jumpDimensions.height);
            //console.log("Jump width:" + this.player.jumpDimensions.width);    
        }
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
        this.game.time.events.add(1000, this.gameOver, this);
        
    },
    
    //this really is an awful way to do this but it works. Could do with refactoring.
    updateHealthGraphic: function (health){
    
        if (health==6) {
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthFull');
            this.health3.loadTexture('healthFull');
        }
        else if (health==5){
            this.health1.loadTexture("healthFull");
            this.health2.loadTexture("healthFull");
            this.health3.loadTexture("healthHalf");
        }
        else if (health==4){
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthFull');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==3){
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthHalf');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==2){
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==1){
            this.health1.loadTexture('healthHalf');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==0){
            this.health1.loadTexture('healthEmpty');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
            this.playerDead();
        }        
    },
    
    increaseItem: function (itemType) {
        if (itemType=="water") {
            water+=5;
            waterLbl.text = "Pee power: " + water;
        }
        else if (itemType=="heart") {
            health+=1;
            this.updateHealthGraphic(health);
        }
        else if (itemType=="poop") {
            score+=100;
            scoreLbl.text = "Score: " + score;
        }
        else if (itemType=="score") {
            score+=50;
            scoreLbl.text = "Score: " + score;
        }
        
    },
    
    decreaseItem: function (itemType) {
        if (itemType=="water") {
            water-=1;
            waterLbl.text = "Pee power: " + water;
        }
        else if (itemType=="heart") {
            health-=1;
            this.updateHealthGraphic(health);
        }
    },
    
    enemyMove: function () {
        this.enemy.body.velocity.x = 10;
        this.enemy.isMoving = true;
    },
    
    render: function () {

        //displays frame rate on screen
        this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        //displays player co-ordinates etc. 
        this.game.debug.bodyInfo(this.player, 0, 80);
    },

};
