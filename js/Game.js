var SideScroller = SideScroller || {};

var gravity = 1000;
var outOfBoundsHeight = 400;
var startPosX = 100;
var startPosY = 300;
var label = null;
var score = 0;
//health starting at 1 just now for testing purposes (making sure health collection works)
var health = 6;

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
        this.map.setCollisionBetween(1, 5000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();
        
        //create collectable items
        this.createItems();
        
        //create player
        //params = (game, startPosX,startPosY, key, frame)
        this.player = this.game.add.sprite(startPosX, startPosY, 'player');
        
        //enable physics on the player
        this.game.physics.arcade.enable(this.player);

        //player gravity
        this.player.body.gravity.y = gravity;
        
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
        
        this.player.anchor.setTo(0.5, 1);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //init game controller
        this.initGameController();

        //sounds
        this.poopSound = this.game.add.audio('poop');
        this.heartSound = this.game.add.audio('heart');
        
        //display score at top right
        var canvasWidth = this.game.canvas.width;
        var canvasHeight = this.game.canvas.height;
        var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
        this.label = this.game.add.text(canvasWidth*0.80, canvasHeight*0.05, "text", style);
        this.label.text = "Score: " + score;
        this.label.fixedToCamera = true;
        
        //display health at top left
        
        this.health1 = this.game.add.sprite(canvasWidth*0.05, canvasHeight*0.10, 'healthFull');
        this.health2 = this.game.add.sprite(canvasWidth*0.10, canvasHeight*0.10, 'healthFull');
        this.health3 = this.game.add.sprite(canvasWidth*0.15, canvasHeight*0.10, 'healthFull');
        
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
        //collision
        this.game.physics.arcade.collide(this.player, this.blockedLayer, this.playerHit, null, this);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        
        //only respond to keys if the player is alive
        if (this.player.alive) {
            this.player.body.velocity.x = 0;

            if (this.cursors.right.isDown) {
                this.playerForward();
            } 
            else if (this.cursors.left.isDown) {
                this.playerBack();
                } 
            else if (this.cursors.up.isDown) {
                    this.playerJump();
                } else if (this.cursors.down.isDown) {
                    this.playerDuck();
                }

            if (!this.cursors.down.isDown && this.player.isDucked && !this.pressingDown) {
                //change image and update the body size for the physics engine
                this.player.loadTexture('player');
                this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
                this.player.isDucked = false;
            }

            //restart the game if reaching the edge
            if (this.player.x >= this.game.world.width) {
                this.game.state.start('Game');
            }
            
            //game over if player falls off platform
            if(this.player.y > outOfBoundsHeight) {
                this.playerDead();
            }
        }        
    },
    
    playerHit: function (player, blockedLayer) {
        //if hits on the left side, die. This was changed from the right side for testing purposes.
        //This will need to be changed at some point as collision (apart from with an enemy) shouldn't cause death.
        if (player.body.blocked.left) {

            console.log(player.body.blocked);
            this.reduceHealth();
        }
    },
    
    collect: function (player, item) {
        if(item.sprite == "poop")
        {
            item.destroy();
            this.poopSound.play();
            this.increaseScore();
        }
        else if (item.sprite == "heart")
        {
            if (health<6)
            {
                item.destroy();
                this.increaseHealth();
                this.heartSound.play();
            }   
        }
       
    },
    
    initGameController: function () {

        if (!GameController.hasInitiated) {
            var that = this;

            GameController.init({
                left: {
                    type: 'joystick',
                    joystick: {
                    radius: 20,
                    }
                },
                right: {
                    type: 'buttons',
                    buttons: [
                
                false,
                        {
                            label: 'J',
                            touchStart: function () {
                                if (!that.player.alive) {
                                    return;
                                }
                                that.playerJump();
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
                        }
                    ]
                },
            });
            GameController.hasInitiated = true;
        }

    },
    
    //create collectable poops
    createItems: function () {
        this.items = this.game.add.group();
        this.items.enableBody = true;
        
        var result = this.findObjectsByType('poo', this.map, 'itemLayer');
        
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
        
        var result2 = this.findObjectsByType('heart', this.map, 'itemLayer');
        
        result2.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    
    gameOver: function () {
        this.game.state.start('Game');
    },

    playerForward: function () {
        this.player.loadTexture('player');
        this.player.body.velocity.x = 700;
        this.player.isMoving = true;
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
        }
    },
    
    playerDuck: function () {
        //change image and update the body size for the physics engine
        this.player.loadTexture('playerDuck');
        this.player.body.setSize(this.player.duckedDimensions.width, this.player.duckedDimensions.height);

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
    
    increaseScore: function () {
        score += 100;
        this.label.text = "Score: " + score;
    },
    
    increaseHealth: function () {
        health += 1;
        this.updateHealthGraphic(health);
    },
    
    reduceHealth: function () {
        health -= 1;
        this.updateHealthGraphic(health);
    },
    
    //this really is an awful way to do this but it works. Could do with refactoring.
    updateHealthGraphic: function (health){
    
        if (health==6) {
            console.log("got here: health = 6");
            this.health1.loadT
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthFull');
            this.health3.loadTexture('healthFull');
        }
        else if (health==5){
            console.log("got here: health = 5");
            console.log(this);
            console.log(this.health1.loadTexture)
            this.health1.loadTexture("healthFull");
            this.health2.loadTexture("healthFull");
            this.health3.loadTexture("healthHalf");
        }
        else if (health==4){
            console.log("got here: health = 4");
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthFull');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==3){
            console.log("got here: health = 3");
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthHalf');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==2){
            console.log("got here: health = 2");
            this.health1.loadTexture('healthFull');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==1){
            console.log("got here: health = 1");
            this.health1.loadTexture('healthHalf');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
        }
        else if (health==0){
            console.log("got here: health = 0");
            this.health1.loadTexture('healthEmpty');
            this.health2.loadTexture('healthEmpty');
            this.health3.loadTexture('healthEmpty');
            this.playerDead();
        }        
    },
    
    render: function () {

        //displays frame rate on screen
        this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        //displays player co-ordinates etc. 
        this.game.debug.bodyInfo(this.player, 0, 80);
    },
};