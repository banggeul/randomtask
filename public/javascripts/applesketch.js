// let canvasY = 1024;
// let canvasX = canvasY * 0.75;

let myObjectNum = 10;
let myObjectSize;

let myObjectX = [];
let myObjectY = [];
let overMyObject = [];
// let locked = [];
let xOffset = [];
let yOffset = [];

let isMoving = [];
let hasMoved = [];
let noMoreMove = [];

let onTree = [];

let orderCounter = 1;
let myOrder = [];

let apple;
let apple_shadow;
let bird;
let bird_shadow;
let bg_sky;
let bg_sun_left;
let bg_sun_right;
let bg_menu;

let tree;
let object;
let object_shadow;

let showOrderNumbers = false;

let myDay;
let myMonth;
let myYear;
let myHour;
let myMinutes;
let mySeconds;
let dateAndTimeStarted;
let timeTaken;

let myTime = {
  startTime: 0,
  endTIme: 0
};

let myCanvas;

let gameMode = "menu";


window.preload = function() {
  // preload() runs once
  apple = loadImage("/images/apples/apple.png");
  apple_shadow = loadImage("/images/apples/apple_shadow.png");

  bg_sky = loadImage("/images/apples/bg_sky.png");
  bg_sun_left = loadImage("/images/apples/bg_sun_left.png");
  bg_sun_right = loadImage("/images/apples/bg_sun_right.png");

  bird = loadImage("/images/apples/bird.png");
  bird_shadow = loadImage("/images/apples/bird_shadow.png");

  bg_menu = loadImage("/images/apples/bg_big_sky.png");
}

window.setup = function() {
  myCanvas = createCanvas(windowWidth, windowHeight);
  myObjectSize = windowWidth / myObjectNum;
  // bigReset(gameMode);
  setUpStartMenu();
  textSize(myObjectSize / 3);
}

window.draw = function() {

  if (gameMode != 'menu') {
    background(220);
    image(tree, 0, 0, width, height);
    //check if the mouse is over the object or not
    // checkTouchOver();
    // checkOnTree();
    drawObjects();
    if (showOrderNumbers) {
      fill(230);
      textSize(myObjectSize / 3);
      text(dateAndTimeStarted + "\nTime Taken: " + round(timeTaken) + " secs", 40, windowHeight - myObjectSize);
      ellipseMode(CORNER);
      ellipse(width - myObjectSize, height - myObjectSize, myObjectSize / 2, myObjectSize / 2);
    }
  }
  //Visualize cut off point for onTree
  //stroke(0);
  //strokeWeight(10);
  //line(0, height * .57, width, height * .57);
}

function setUpStartMenu() {
  image(bg_menu, 0, 0, width, height);
  gameMode = "menu";
  let btn_sunLeft = createButton('Sun Left');
  // btn_sunLeft.position(width*.3, height*.2);
  btn_sunLeft.touchStarted(() => {
    initGame('sunLeft');
  });
  btn_sunLeft.mousePressed(() => {
    initGame('sunLeft');
  });

  btn_sunLeft.addClass('top');

  let btn_sunRight = createButton('Sun Right');
  // btn_sunRight.position(width*.3, height*.4);
  btn_sunRight.touchStarted(() => {
    initGame('sunRight');
  });
  btn_sunRight.mousePressed(() => {
    initGame('sunRight');
  });

  btn_sunRight.addClass('middle');

  let btn_birds = createButton('Bird Nest');
  // btn_birds.position(width*.3, height*.6);
  btn_birds.touchStarted(() => {
    initGame('birds');
  });
  btn_birds.mousePressed(() => {
    initGame('birds');
  });


  btn_birds.addClass('bottom');
}

function initGame(mode) {
  removeElements();
  gameMode = mode;
  bigReset(gameMode);
  console.log('load the game with the mode: ' + mode);
}

function bigReset(mode) {

  switch (mode) {
    case "sunLeft":
      tree = bg_sun_left;
      object = apple;
      object_shadow = apple_shadow;
      break;
    case "sunRight":
      tree = bg_sun_right;
      object = apple;
      object_shadow = apple_shadow;
      break;
    case "birds":
      tree = bg_sky;
      object = bird;
      object_shadow = bird_shadow;
      break;
    default:
      tree = bg_sun_left;
      object = apple;
      object_shadow = apple_shadow;
  }

  for (let i = 0; i < myObjectNum; i++) {
    myObjectX[i] = i * myObjectSize;
    myObjectY[i] = windowHeight - myObjectSize * 1.3;
    
    overMyObject[i] = false;
    xOffset[i] = 0.0;
    yOffset[i] = 0.0;

    isMoving[i] = false;
    hasMoved[i] = false;
    noMoreMove[i] = false;
    onTree[i] = false;
    myOrder[i] = myObjectNum;
  }
  orderCounter = 1;
  showOrderNumbers = false;
  setMyDate();
  console.log("RESET");
}

function drawObjects() {
  for (let i = 0; i < myObjectNum; i++) {
    if (noMoreMove[i]) {
      image(object, myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);
    } else {
      image(object_shadow, myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);
    }
    noFill();
    //rect(myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);

    if (showOrderNumbers) {
      textSize(myObjectSize / 1.4);
      fill(0);
      text(myOrder[i], myObjectX[i] + 2 + myObjectSize * .35, myObjectY[i] + 3 + myObjectSize * .8);
      textSize(myObjectSize / 1.45);
      fill(220, 220, 255);
      text(myOrder[i], myObjectX[i] + myObjectSize * .35, myObjectY[i] + myObjectSize * .8);
    }
  }
}

function setMyDate() {
  myDay = nf(day(), 2);
  myMonth = nf(month(), 2);
  myYear = year();
  myHour = nf(hour(), 2);
  myMinutes = nf(minute(), 2);
  mySeconds = nf(second(), 2);
  dateAndTimeStarted =
    myMonth +
    "/" +
    myDay +
    "/" +
    myYear +
    " " +
    myHour +
    ":" +
    myMinutes +
    ":" +
    mySeconds;

  myTime.startTime = millis();
  myTime.endTime = 0;
}

function checkOnTree() {
  for (let i = 0; i < myObjectNum; i++) {
    if (myObjectY[i] < height * 0.57) {
      onTree[i] = true;
    } else {
      onTree[i] = false;
    }
  }
}

function checkTouchOver() {
  for (let i = 0; i < myObjectNum; i++) {
    if (
      mouseX > myObjectX[i] &&
      mouseX < myObjectX[i] + myObjectSize &&
      mouseY > myObjectY[i] &&
      mouseY < myObjectY[i] + myObjectSize
    ) {
      overMyObject[i] = true;
    } else {
      overMyObject[i] = false;
    }
  }
}

window.touchStarted = function() {
  console.log("touch started");
  checkTouchOver();
  checkOnTree();
  for (let i = 0; i < myObjectNum; i++) {
    if (overMyObject[i]) {
      console.log("hey it's over apple :" + i);
    }
  }

  for (let i = 0; i < myObjectNum; i++) {
    if (overMyObject[i] && !noMoreMove[i]) {
      for (let j = 0; j < myObjectNum; j++) {
        if (hasMoved[j] && !overMyObject[j] && onTree[j]) {
          noMoreMove[j] = true;
          hasMoved[j] = false;
          myOrder[j] = orderCounter;
          orderCounter++;

        }
      }
    }

    if (overMyObject[i] && !noMoreMove[i]) {
      isMoving[i] = true;
    }
    xOffset[i] = mouseX - myObjectX[i];
    yOffset[i] = mouseY - myObjectY[i];
  }

  if (orderCounter >= myObjectNum - 1 && mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
    showOrderNumbers = !showOrderNumbers;
    // for (let i = 0; i < myObjectNum; i++) {
    //   hasMoved[j] = false;
    //   noMoreMove[i] = false;
    // }

    //game is all finished
    //record the end time
    //check if the end time has already been set
    if (myTime.endTime == 0) {
      myTime.endTime = millis();
      timeTaken = (myTime.endTime - myTime.startTime) * .001;
    }
  }
  if (showOrderNumbers && mouseX < width && mouseX > width - myObjectSize && mouseY < height && mouseY > height - myObjectSize) {
    saveCanvas(myCanvas, dateAndTimeStarted + ".jpg");
    // bigReset();
    setUpStartMenu();
  }
  return false;
}

window.touchMoved = function() {
  for (let i = myObjectNum-1; i >= 0; i--) {
    if (!noMoreMove[i] && isMoving[i]) {
      myObjectX[i] = mouseX - xOffset[i];
      myObjectY[i] = mouseY - yOffset[i];
                break;
    }
  }
  // console.log(mouseX, mouseY);
  return false;
}

window.touchEnded = function() {
  for (let i = 0; i < myObjectNum; i++) {
    if (isMoving[i]) {
      isMoving[i] = false;
      hasMoved[i] = true;
    }
  }
  console.log("touch ended");
  // return false;
}

// function mouseDragged() {
//   for (let i = 0; i < myObjectNum; i++) {
//     if (locked[i] && !noMoreMove[i]) {
//       myObjectX[i] = mouseX - xOffset[i];
//       myObjectY[i] = mouseY - yOffset[i];
//     }
//   }
// }
// function mouseReleased() {
//   for (let i = 0; i < myObjectNum; i++) {
//     locked[i] = false;
//     if (isMoving[i]) {
//       isMoving[i] = false;
//       hasMoved[i] = true;
//     }
//   }
// }
