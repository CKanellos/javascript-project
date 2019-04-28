/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/

const monsterNames = [
  'Bigfoot',
  'Centaur',
  'Cerberus',
  'Chimera',
  'Ghost',
  'Goblin',
  'Golem',
  'Manticore',
  'Medusa',
  'Minotaur',
  'Ogre',
  'Vampire',
  'Wendigo',
  'Werewolf',
];

const RARITY_LIST = ['Common', 'Unusual', 'Rare', 'Epic'];

// Array of item objects. These will be used to clone new items with the appropriate properties.
const items = [
  {
    name: 'Common potion',
    type: 'potion',
    value: 5,
    rarity: 0,
    use: function(target) {
      let potionHp = 25;
      target.hp += potionHp;
      if (target.hp > target.getMaxHp()) {
        target.hp = target.getMaxHp();
      }
      print('Used potion! +' + potionHp + 'hp (Total HP: ' + target.hp + ')', 'green');
    }
  },
  {
    name: 'Common bomb',
    type: 'bomb',
    value: 7,
    rarity: 0,
    use: function(target) {
      let bigBang = 50;
      target.hp -= bigBang;
      if (target.hp < 0) {
        target.hp = 0;
      }
      print('Used bomb!', 'orange');
      print(target.name + ' Hit! -' + bigBang, 'purple');
      print('HP left: ' + target.hp, 'purple');
    }
  },
  {
    name: 'Epic key',
    type: 'key',
    value: 150,
    rarity: 3,
    use: function(target) {
      target.isLocked = false;
      print('Unlocking dungeon...', 'red');
      unlockedDungeon(target);
    }
  }
]; 

const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.
let player = {}; // The player object

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count = 20) {
  let dashes = '';
  for (let i = 0; i < count; i++) {
    dashes += '-';
  }
  print(dashes + title + dashes, 'blue');
}

// Returns a new object with the same keys and values as the input object
function clone(entity) {
  let obj = {};
  let keys = Object.keys(entity);
  let values = Object.values(entity);
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i];
  }
  return obj;
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEqual(obj1, obj2) {
  let obj1keys = Object.keys(obj1);
  let obj1values = Object.values(obj1);
  let obj2keys = Object.keys(obj2);
  let obj2values = Object.values(obj2);
  if (obj1keys.length !== obj2keys.length) {
    return false;
  }
  for (let i = 0; i < obj1keys.length; i++) {
    if (obj1keys[i] !== obj2keys[i] || obj1values[i] !== obj2values[i]) {
      return false;
    }
  }
  return true;
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
  let arr = [];
  for (let i = 0; i < objs.length; i++) {
    let cloneObj = clone(objs[i]); 
    arr.push(cloneObj);
  }
  return arr;
}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {
  let i;
  for (i = 0; i < player.items.length; i++) {
    if (player.items[i].name === itemName) {
      break; 
    }
  }
  if (i < player.items.length) {
    let item = player.items[i];
    if (typeof(target) === 'undefined') {
      if (item.type === 'potion') {
        target = player;
      }
      else {
        target = board[player.position.row][player.position.column];
      }
    }
    item.use(target);
    player.items.splice(i, 1);
  }
}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      if (i === 0 || j === 0 || i === rows - 1 || j === columns - 1) {
        board[i][j] = {
          type: 'wall',
          position: { row: i, column: j }
        }; 
      }
      else {
        board[i][j] = {
          type: 'grass',
          position: { row: i, column: j }
        };
      }
    }
  }
}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  board[entity.position.row][entity.position.column] = entity;
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer() {
  player.position = {
    row: Math.floor(board.length / 2),
    column: Math.floor(board[0].length / 2)
  };
}

// Creates the board and places player
function initBoard(rows, columns) {
  print("Creating board and placing player...");
  createBoard(rows, columns);
  placePlayer();
}

// Prints the board
function printBoard() {
  for (let i = 0; i < board.length; i++) {
    let rowString  = "";
    for (let j = 0; j < board[i].length; j++) {
      if (i === player.position.row && j === player.position.column) {
        rowString += 'P';
      }
      else if (board[i][j].type === 'wall') {
        rowString += "#";
      }
      else if (board[i][j].type === 'grass') {
        rowString += ".";
      }
      else if (board[i][j].type === 'monster') {
        rowString += 'M';
      }
      else if (board[i][j].type === 'tradesman') {
        rowString += 'T';
      }
      else if (board[i][j].type === 'potion' || board[i][j].type === 'bomb' || board[i][j].type === 'key') {
        rowString += 'I';
      }
      else if (board[i][j].type === 'dungeon') {
        rowString += 'D';
      }
    }
    print(rowString);
  }
}

// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  print("Create player with name " + name + " and level " + level);
  player = {
    name: name,
    level: level,
    items: cloneArray(items),
    skills: [], /* TODO */
    attack: level * 10,
    speed: 3000 / level,
    hp: level * 100,
    gold: 0,
    exp: 0,
    type: 'player',
    getMaxHp: function() {
      return this.level * 100;
    },
    levelUp: function() {
      this.exp -= this.getExpToLevel();
      this.level++;
      this.speed = 3000 / this.level;
      this.attack = this.level * 10;
    },
    getExpToLevel: function() {
      return this.level * 20;
    }
  }; 
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  print('Creating monster...');
  let name = monsterNames[Math.floor(Math.random() * monsterNames.length)];
  return {
    name: name,
    level: level, 
    hp: level * 100,
    attack: level * 10,
    speed: 6000 / level,
    items: cloneArray(items),
    position: {
      row: position.row,
      column: position.column
    },
    type: 'monster',
    getMaxHp: function () {
      return this.level * 100;
    },
    getExp: function () {
      return this.level * 10;
    }
  };
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  print('Creating tradesman...'); 
  return {
    name: 'Mr. Trader',
    hp: Infinity,
    items: cloneArray(items),
    position: {
      row: position.row,
      column: position.column
    },
    type: 'tradesman',
    getMaxHp: function () {
      return Infinity;
    }
  };
} 

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  print('Creating item...');
  let cloneItem = clone(item);
  cloneItem.position = {
    row: position.row,
    column: position.column
  };
  return cloneItem;
}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  print('Creating dungeon...');
  return {
    isLocked: isLocked,
    hasPrincess: hasPrincess,
    items: cloneArray(items),
    gold: gold,
    position: {
      row: position.row,
      column: position.column
    },
    type: 'dungeon'
  };
}

// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {
  let newPosition;
  switch (direction) {
    case 'U':
      newPosition = {
        row: player.position.row - 1 ,
        column: player.position.column
      };
      break;
    case 'R':
      newPosition = {
        row: player.position.row,
        column: player.position.column + 1
      };
      break;
    case 'D':
      newPosition = {
        row: player.position.row + 1 ,
        column: player.position.column
      };
      break;
    case 'L':
      newPosition = {
        row: player.position.row,
        column: player.position.column - 1
      };
      break;
  }
  if (board[newPosition.row][newPosition.column].type !== 'wall') {
    player.position = newPosition;
    let entity = board[player.position.row][player.position.column];
    if (entity.type === 'monster') {
      print('Encountered a ' + entity.name);
      battleMonster(entity);
    }
    else if (entity.type === 'tradesman') {
      print('Encountered ' + entity.name);
      /* Trade with him ? */
    }
    else if (entity.type === 'potion' || entity.type === 'bomb' || entity.type === 'key') {
      print('Found a ' + entity.name);
      collectItem(entity);
    }
    else if (entity.type === 'dungeon') {
      print('Found dungeon!');
      if (entity.isLocked) {
        lockedDungeon(entity);
      }
      else {
        unlockedDungeon(entity);
      }
    }
  }
  printBoard();
}

function battleMonster(monster) {
  let playerAttackIntervalId = setInterval(function() {
    monster.hp -= player.attack;
    if (monster.hp < 0) {
      monster.hp = 0;
    }
    print(monster.name + ' Hit! -' + player.attack, 'purple');
    print('HP left: ' + monster.hp, 'purple');
    if (monster.hp === 0) {
      print(monster.name + ' defeated.');
      let monsterExp = monster.getExp();
      player.exp += monsterExp;
      print('Congratulations! You have received ' + monsterExp + ' exp points.');
      if (player.exp >= player.getExpToLevel()) {
        player.levelUp();
      }
      print('You received the following items:');
      print(cloneArray(monster.items));
      while (monster.items.length > 0) {
        player.items.push(monster.items.shift());
      }
      updateBoard({
        type: 'grass',
        position: {
          row: monster.position.row,
          column: monster.position.column
        }
      });  
      clearInterval(playerAttackIntervalId);
      clearInterval(monsterAttackIntervalId);
    }
  }, player.speed);
  let monsterAttackIntervalId = setInterval(function() {
    player.hp -= monster.attack;
    if (player.hp < 0) {
      player.hp = 0;
    }
    print(player.name + ' Hit! -' + monster.attack, 'red');
    print('HP left: ' + player.hp, 'red');
    if (player.hp === 0) {
      print(player.name + ' defeated.');
      gameOver();
      clearInterval(monsterAttackIntervalId);
      clearInterval(playerAttackIntervalId);
    }
  }, monster.speed); 
}

function visitTradesman(tradesman) {
  /* TODO */
}

function collectItem(item) {
  player.items.push(item);
  updateBoard({
    type: 'grass',
    position: {
      row: item.position.row,
      column: item.position.column
    }
  }); 
  delete item.position;
}

function lockedDungeon(dungeon) {
  print('You need a key to open it. If you have the key, you can unlock the door.');
  print('Rumours are some monsters have keys to dungeons.');
  print('The tradesman may have spare keys to sell, but they don\'t come cheap!');
}

function unlockedDungeon(dungeon) {
  print('The dungeon is unlocked!');
  if (dungeon.hasPrincess) {
    print('You have freed the princess! Congratulations!');
    print('The adveturer ' + player.name + ' and the princess lived hapilly ever after.');
    gameOver();
  }
  else {
    print('Unfortunately, there was no princess.');
    print('As consolation, you found ' + dungeon.items.length + ' items and ' + dungeon.gold + ' gold.');
    print(cloneArray(dungeon.items));
    while (dungeon.items.length > 0) {
      player.items.push(dungeon.items.shift());
    }
    player.gold += dungeon.gold;
    dungeon.gold = 0;
    print ('You now have ' + player.gold + ' gold');
  }
}

function setupPlayer() {
  printSectionTitle('SETUP PLAYER');
  print("Please create a player using the createPlayer function. Usage: createPlayer('Bob')");
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle('SETUP BOARD');
  print('Please create a board using initBoard(rows, columns)');
  print(
    'Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)'
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle('START GAME');
  print('Hello ' + player.name);
  print("You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going.");
  printBoard();
}

function gameOver() {
  printSectionTitle('GAME OVER');
}

function next() {
  gameStep++;
  run();
}

/* TESTING ENTITIES */
function test() {
  createPlayer('CK', 1, [items[0]]);
  next();
  initBoard(7, 15);
  updateBoard(createMonster(1, [items[1]], {row: 3, column: 6}));
  updateBoard(createTradesman([items[0]], {row: 2, column: 5}));
  updateBoard(createItem(items[0], {row: 4, column: 2}));
  updateBoard(createDungeon({ row: 5, column: 8}, false, false, [items[2], items[0]] , 40));
  next();
}

function run() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}

print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

run();
