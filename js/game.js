var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,

    delayToStartLevel: 3,
    padding: 30,
};

var states = {
    main: "main",
    game: "game",
};

var graphicAssets = {
    ship:{URL:'assets/ship.png', name:'ship'},    
    
    asteroidLarge:{URL:'assets/asteroidLarge.png', name:'asteroidLarge'},
    asteroidMedium:{URL:'assets/asteroidMedium.png', name:'asteroidMedium'},
    asteroidSmall:{URL:'assets/asteroidSmall.png', name:'asteroidSmall'},
    
    background:{URL:'assets/earthBackground.png', name:'background'},
    explosionLarge:{URL:'assets/explosionLarge.png', name:'explosionLarge', width:64, height:64, frames:8},
    explosionMedium:{URL:'assets/explosionMedium.png', name:'explosionMedium', width:58, height:58, frames:8},
    explosionSmall:{URL:'assets/explosionSmall.png', name:'explosionSmall', width:41, height:41, frames:8},
};

var shipProperties = {
    startX: gameProperties.screenWidth * 0.5,
    startY: gameProperties.screenHeight * 0.5,
    acceleration: 300,
    drag: 100,
    maxVelocity: 300,
    angularVelocity: 200,
    startingLives: 1,
    timeToReset: 3,
    blinkDelay: 0.2,
};

var asteroidProperties = {
    startingAsteroids: 10,
    maxAsteroids: 20,
    incrementAsteroids: 2,
    
    asteroidLarge: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 20, nextSize: graphicAssets.asteroidMedium.name, pieces: 2, explosion:'explosionLarge' },
    asteroidMedium: { minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 50, nextSize: graphicAssets.asteroidSmall.name, pieces: 2, explosion:'explosionMedium' },
    asteroidSmall: { minVelocity: 50, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100, explosion:'explosionSmall' }, 
};

var fontAssets = {
    counterFontStyle:{font: '20px Arial', fill: '#FF0000', align: 'center'},
};

var gameState = function (game){
    this.shipSprite;
    this.shipIsInvulnerable;
    
    this.key_left;
    this.key_right;
    this.key_thrust;

    this.asteroidGroup;
    
    this.tf_lives;
    this.tf_livesLabel;
    this.tf_scoreLabel
    this.tf_score;
    
    this.backgroundSprite;
    
    this.explosionLargeGroup;
    this.explosionMediumGroup;
    this.explosionSmallGroup;
};

gameState.prototype = {
    
    preload: function () {
        game.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
        game.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
        game.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidSmall.URL);
        
        game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL);
        
        game.load.image(graphicAssets.background.name, graphicAssets.background.URL);
        game.load.spritesheet(graphicAssets.explosionLarge.name, graphicAssets.explosionLarge.URL, graphicAssets.explosionLarge.width, graphicAssets.explosionLarge.height, graphicAssets.explosionLarge.frames);
        game.load.spritesheet(graphicAssets.explosionMedium.name, graphicAssets.explosionMedium.URL, graphicAssets.explosionMedium.width, graphicAssets.explosionMedium.height, graphicAssets.explosionMedium.frames);
        game.load.spritesheet(graphicAssets.explosionSmall.name, graphicAssets.explosionSmall.URL, graphicAssets.explosionSmall.width, graphicAssets.explosionSmall.height, graphicAssets.explosionSmall.frames);
    },
    
    init: function () {
        this.asteroidsCount = asteroidProperties.startingAsteroids;
        this.shipLives = shipProperties.startingLives;
        this.score = 0;
        this.time = 0;
    },
    
    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.resetAsteroids();
    },
	
/*	post_to_url: function (path, params) {
	method = 'POST';

	var form = document.createElement('form');
        		
    // Move the submit function to another variable
    // so that it doesn't get overwritten.
    form._submit_function_ = form.submit;

    form.setAttribute('method', method);
    form.setAttribute('action', path);
    form.setAttribute('target', '_blank');

    for(var key in params) {
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form._submit_function_(); // Call the renamed function.
	},*/

    update: function () {
        this.checkPlayerInput();
        this.checkBoundaries(this.shipSprite);
        this.asteroidGroup.forEachExists(this.checkBoundaries, this);
        
        if (!this.shipIsInvulnerable) {
            game.physics.arcade.overlap(this.shipSprite, this.asteroidGroup, this.asteroidCollision, null, this);
            if (this.time >= 100 && this.shipLives > 0)
	        {
	        	this.updateScore(1);
	        	this.time = 0;
	        }
	        /*else if (this.shipLives == 0)
	        {
	        	this.post_to_url('/score/', {score: this.score});

	        }*/
	        else
	        {
	        	this.time += 1;   
	        }
	    }
    },
    
    initGraphics: function () {
        this.backgroundSprite = game.add.sprite(0, 0, graphicAssets.background.name);
        
        this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
        this.shipSprite.angle = -90;
        this.shipSprite.anchor.set(0.5, 0.5);
        
        this.asteroidGroup = game.add.group();
        
        this.tf_lives = game.add.text(20, 30, shipProperties.startingLives, fontAssets.counterFontStyle);

        this.tf_livesLabel = game.add.text(20, 10, "Lives", fontAssets.counterFontStyle);
        
        this.tf_scoreLabel = game.add.text(gameProperties.screenWidth - 20, 10, "Score", fontAssets.counterFontStyle);
        this.tf_scoreLabel.align = 'right';
        this.tf_scoreLabel.anchor.set(1, 0);

        this.tf_score = game.add.text(gameProperties.screenWidth - 20, 30, "0", fontAssets.counterFontStyle);
        this.tf_score.align = 'right';
        this.tf_score.anchor.set(1, 0);
                
        this.explosionLargeGroup = game.add.group();
        this.explosionLargeGroup.createMultiple(20, graphicAssets.explosionLarge.name, 0);
        this.explosionLargeGroup.setAll('anchor.x', 0.5);
        this.explosionLargeGroup.setAll('anchor.y', 0.5);
        this.explosionLargeGroup.callAll('animations.add', 'animations', 'explode', null, 30);
        
        this.explosionMediumGroup = game.add.group();
        this.explosionMediumGroup.createMultiple(20, graphicAssets.explosionMedium.name, 0);
        this.explosionMediumGroup.setAll('anchor.x', 0.5);
        this.explosionMediumGroup.setAll('anchor.y', 0.5);
        this.explosionMediumGroup.callAll('animations.add', 'animations', 'explode', null, 30);
        
        this.explosionSmallGroup = game.add.group();
        this.explosionSmallGroup.createMultiple(20, graphicAssets.explosionSmall.name, 0);
        this.explosionSmallGroup.setAll('anchor.x', 0.5);
        this.explosionSmallGroup.setAll('anchor.y', 0.5);
        this.explosionSmallGroup.callAll('animations.add', 'animations', 'explode', null, 30);
    },
    
    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);
        
        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    },
    
    initKeyboard: function () {
        this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    },
    
    checkPlayerInput: function () {
        if (this.key_left.isDown) {
            this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity;
        } else if (this.key_right.isDown) {
            this.shipSprite.body.angularVelocity = shipProperties.angularVelocity;
        } else {
            this.shipSprite.body.angularVelocity = 0;
        }
        
        if (this.key_thrust.isDown) {
            game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration);
        } else {
            this.shipSprite.body.acceleration.set(0);
        }

    },
    
    checkBoundaries: function (sprite) {
        if (sprite.x + gameProperties.padding < 0) {
            sprite.x = game.width + gameProperties.padding;
        } else if (sprite.x - gameProperties.padding> game.width) {
            sprite.x = -gameProperties.padding;
        } 

        if (sprite.y + gameProperties.padding < 0) {
            sprite.y = game.height + gameProperties.padding;
        } else if (sprite.y - gameProperties.padding> game.height) {
            sprite.y = -gameProperties.padding;
        }
    },
    
    createAsteroid: function (x, y, size, pieces) {
        if (pieces === undefined) { pieces = 1; }
        
        for (var i=0; i<pieces; i++) {
            var asteroid = this.asteroidGroup.create(x, y, size);
            asteroid.anchor.set(0.5, 0.5);
            asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);

            var randomAngle = game.math.degToRad(game.rnd.angle());
            var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);

            game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    },
    
    resetAsteroids: function () {
        for (var i=0; i < this.asteroidsCount; i++ ) {
            var side = Math.round(Math.random());
            var x;
            var y;
            
            if (side) {
                x = Math.round(Math.random()) * gameProperties.screenWidth;
                y = Math.random() * gameProperties.screenHeight;
            } else {
                x = Math.random() * gameProperties.screenWidth;
                y = Math.round(Math.random()) * gameProperties.screenWidth;
            }
            
            this.createAsteroid(x, y, graphicAssets.asteroidLarge.name);
        }
    },
    
    asteroidCollision: function (target, asteroid) {        
        target.kill();
        asteroid.kill();
        
        if (target.key == graphicAssets.ship.name) {
            this.destroyShip();
        }
        
        this.splitAsteroid(asteroid);
        
        if (!this.asteroidGroup.countLiving()) {
            game.time.events.add(Phaser.Timer.SECOND * gameProperties.delayToStartLevel, this.nextLevel, this);
        }
        
        var explosionGroup = asteroidProperties[asteroid.key].explosion + "Group";
        var explosion = this[explosionGroup].getFirstExists(false);
        explosion.reset(asteroid.x, asteroid.y);
        explosion.animations.play('explode', 30, false, true);
    },
    
    destroyShip: function () {
        this.shipLives --;
        this.tf_lives.text = this.shipLives;

        if (this.shipLives) {
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.resetShip, this);
        } else {
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.endGame, this);
        }
    },
    
    resetShip: function () {
        this.shipIsInvulnerable = true;
        this.shipSprite.reset(shipProperties.startX, shipProperties.startY);
        this.shipSprite.angle = -90;
        
        game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.shipReady, this);
        game.time.events.repeat(Phaser.Timer.SECOND * shipProperties.blinkDelay, shipProperties.timeToReset / shipProperties.blinkDelay, this.shipBlink, this);
    },
    
    shipReady: function () {
        this.shipIsInvulnerable = false;
        this.shipSprite.visible = true;
    },
    
    shipBlink: function () {
        this.shipSprite.visible = !this.shipSprite.visible;
    },
    
    splitAsteroid: function (asteroid) {
        if (asteroidProperties[asteroid.key].nextSize) {
            this.createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.key].nextSize, asteroidProperties[asteroid.key].pieces);
        }
    },
    
    updateScore: function (score) {
        this.score += score;
        this.tf_score.text = this.score;
    },
    
    nextLevel: function () {
        this.asteroidGroup.removeAll(true);
        
        if (this.asteroidsCount < asteroidProperties.maxAsteroids) {
            this.asteroidsCount += asteroidProperties.incrementAsteroids;
        }
        
        this.resetAsteroids();
    },
    
    endGame: function () {
        game.state.start(states.main);
    },
};

var mainState = function(game){
    this.tf_start;
    this.key_start;
};

mainState.prototype = {
    create: function () {
        var startInstructions = '~~ ISS DANGER ~~\n\n\nClick SPACEBAR to Start\n\n\nControls:\n\nUP Arrow Key to Move Forward.\nLEFT or RIGHT Arrow Keys to Make Turns.';
        
        this.tf_start = game.add.text(game.world.centerX, game.world.centerY, startInstructions, fontAssets.counterFontStyle);
        this.tf_start.align = 'center';
        this.tf_start.anchor.set(0.5, 0.5);
        
        this.key_start = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.key_start.onDown.addOnce(this.startGame,this);
        //game.input.onDown.addOnce(this.startGame, this);
    },
    
    startGame: function () {
        game.state.start(states.game);
    },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.main, mainState);
game.state.add(states.game, gameState);
game.state.start(states.main);