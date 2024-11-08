var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#AAD4EA',
  parent: "gameTime", // ID of the DOM element to add the canvas to
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

//variable declaration block
var map;
var layer;
var player;
var cursors;
var coinLayer;
var coin2Layer;
var coins;
var coins2;
let coinScore = 0;
var gameOver = false;


function preload() {

  //slightly different preload because this spritesheet has aa margin and spacing between each frame
  this.load.spritesheet('popeye', 'assets/sprites/popeye.png', {
    frameWidth: 16,
    frameHeight: 16,
    margin: 16,
    spacing: 32
  });

  //load map tilesets
  //params: 'key', 'path'
  this.load.image('1tileset', 'assets/tiledMap/tileset1.png');
  this.load.image('2tileset', 'assets/tiledMap/tileset2.png');

  //load map json file
  //params: 'key', 'path'
  this.load.tilemapTiledJSON('myMap', 'assets/tiledMap/demoMap.tmj');

  //load spritesheet for the coin collectable
  this.load.spritesheet('coin', 'assets/sprites/spinach.png', {
    frameWidth: 28,
    frameHeight: 32
  });

  this.load.spritesheet('coin2', 'assets/sprites/bluto.png', {
    frameWidth: 28,
    frameHeight: 32
  });


}
function create() {

  /////////////////////////////  Map Load  //////////////////////////////////

  // make the map
  const map = this.make.tilemap({ key: "myMap" });

  //*********Tilesets *************/
  // Add tilesets to the map in vars
  //Params: 'name you gave the tileset in Tiled', 'key of the tileset image in preload'
  const gTileset = map.addTilesetImage("tileset1", "1tileset");
  const tTileset = map.addTilesetImage("tileset2", "2tileset");


  //*********Create Layers *************/


  // create the layers -- order closest to furthest
  //Params: 'layer name from Tiled', tileset, x, y
  //NOTE: Phaser only supports one tileset per layer!!
  const belowLayer = map.createLayer("belowPlayer", gTileset, 0, 0);
  const worldLayer = map.createLayer("world", gTileset, 0, 0);
  const aboveLayer2 = map.createLayer("abovePlayer2", gTileset, 0, 0);
  const aboveLayer = map.createLayer("abovePlayer", tTileset, 0, 0);
  const aboveTrees = map.createLayer("aboveTrees", tTileset, 0, 0);

  aboveTrees.setDepth(10);

  //create the collectable coin layer 
  //params: name of layer in Tiled
  coinLayer = map.getObjectLayer('collectables')['objects'];
  coin2Layer = map.getObjectLayer('collectables2')['objects'];


  //*********Collision!  *************/

  //visual debugger that highlights the graphics on the layer for debugging
  //const debugGraphics = this.add.graphics().setAlpha(0.75);
  //worldLayer.renderDebug(debugGraphics, {
  //  tileColor: null, // Color of non-colliding tiles
  //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  //  faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  //});

  // We add the 'collides' property in Tiled Tileset editor
  //property only turned on for the colliding tiles
  worldLayer.setCollisionByProperty({ collides: true });

  //*********Changing z-index so noe layer in 'on top' of player *************/

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we want the foreground layer to sit on top of the player (which is created later), so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.


  //*********World Boundries *************/
  // set the boundaries of our game world to the width and height of the background layer

  // set the boundaries of our game world
  this.physics.world.bounds.width = belowLayer.width;
  this.physics.world.bounds.height = belowLayer.height;




  /////////////////////////////Collectables//////////////////////////////////
  //create a static group that all the coins will be inside 
  //needs to be ddefined in the variable declaration block

  //this is how we actually render our coin object with coin asset we loaded into our game in the preload function
  //These need to be all separate so they can be removed individually later

  coins = this.physics.add.staticGroup()
  //this is how we actually render our coin object with coin asset we loaded into our game in the preload function
  coinLayer.forEach(object => {
    let obj = coins.create(object.x, object.y, "coin");
    obj.setScale(0.5);
    //obj.setOrigin(0); 
    obj.body.width = object.width;
    obj.body.height = object.height;
  });

  coins2 = this.physics.add.staticGroup()
  coin2Layer.forEach(object => {
    let obj = coins2.create(object.x, object.y, "coin2");
    obj.setScale(0.5);
    //obj.setOrigin(0); 
    obj.body.width = object.width;
    obj.body.height = object.height;
  });




  ///////////////////////////////Player//////////////////////////////////

  //player code
  player = this.physics.add.sprite(70, 110, 'popeye');
  player.setCollideWorldBounds(true);

  //*********Player Collisions *************/
  // This will watch the player and worldLayer every frame to check for collisions
  this.physics.add.collider(player, worldLayer);

  //This will watch the playere and the coins every frame to check for collisions
  //then it will call a function called 'collectCoin' and pass the specific coin it hit
  this.physics.add.overlap(player, coins, coinCollector, null, this);
  this.physics.add.overlap(player, coins2, gameLost, null, this);



  //*********Animations *************/
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('popeye', { start: 8, end: 11 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('popeye', { start: 12, end: 15 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('popeye', { start: 4, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('popeye', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'idle',
    frames: [{ key: 'popeye', frame: 0 }],
    frameRate: 20
  });


  ///////////////////// HUD ///////////////////////////////////

  //********* Score *************/
  //add text 
  //params: x, y, 'text', {options}
  //score
  text = this.add.text(350, 5, `Spinach: ${coinScore}x`, {
    fontSize: '20px',
    fill: '#ffffff'
  });
  text.setScrollFactor(0);


  ////////////////////// Keyboard Tracking ////////////////////
  cursors = this.input.keyboard.createCursorKeys();

  /////////////////////// Camera Following /////////////////////
  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)



}

function update() {

  ////////////////////// Variable to 'stop the game' ////////////
  if (gameOver) {
    return;
  }

  ////////////////////// Player Movements ///////////////////////

  //*********default settings *************/
  const speed = 175;

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  //********* Direction movement *************/
  // Horizontal movement
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.anims.play("right", true);
  } else if (cursors.up.isDown) {
    player.anims.play("up", true);
  } else if (cursors.down.isDown) {
    player.anims.play("down", true);
  } else {
    player.anims.stop();
  }
}

////////////////////////// Function for Coin Collection ///////////////////////
function coinCollector(player, coin) {
  console.log("collect");

  coin.destroy(coin.x, coin.y); // remove the tile/coin
  coinScore++; // increment the score
  text.setText(`Spinach: ${coinScore}x`); // set the text to show the current score

  if (coinScore == 15) {
    this.physics.pause();

    player.setTint(0x0AE1E9);

    player.anims.play('idle');

    text = this.add.text(200, 70, `You Win!!`, {
      fontSize: '100px',
      fill: '#FFFFFF'
    });
    text.setScrollFactor(0);


    gameOver = true;
  }
}

function gameLost(player, coin) {
  console.log("collect");

  coin.destroy(coin.x, coin.y); // remove the tile/coin
  this.physics.pause();

  player.setTint(0xFF0000);

  player.anims.play('idle');

  text = this.add.text(200, 70, `You Lost!!`, {
    fontSize: '100px',
    fill: '#FFFFFF'
  });
  text.setScrollFactor(0);

  gameOver = true;
}