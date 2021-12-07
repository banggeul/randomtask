import storeSubject from '/utils/subject_storage.js'
import store from '/utils/apple_storage.js'
//import the data storing script
import {
  postData,
  getData,
  putData
} from '/utils/data.js'
//get the current data stored, unpack it as object
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};
let currentSubject = {};
let currentSubjectID;

const urlParams = new URLSearchParams(window.location.search);
const subjectNumParam = urlParams.get('subject');
const ageGroupParam = urlParams.get('age');
const id = urlParams.get('id');
let subjects = [];
let subjectNum;
let ageGroup;
let gameOn = false;
let gameOrder = [];
let gameIndex = 0;
const $instructionMsg = document.querySelector("#instructionMsg");

// fetch the subjectNumbers collection
async function fetchSubject(){
  let response = await fetch('/subjects');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchSubjectById(){
  let response = await fetch('/single_subject/'+id);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

fetchSubjectById().then((data) => {
  //now do something with it
  subjectNum = parseInt(subjectNumParam);
  ageGroup = parseInt(ageGroupParam);
  currentSubject = data.experiment;
  //set the game order based on the subjecNum
  if(subjectNum%2==0){
    gameOrder = ["apple","birds"];
    $instructionMsg.innerHTML = "This is the instruction for the apple game";
  } else {
    gameOrder = ["birds","apple"];
    $instructionMsg.innerHTML = "This is the instruction for the birds game";
  }
  //but for now just set it as the first one
  document.querySelector('#startBtn').addEventListener('touchstart', startTask);
  //show instruction
  showInstruction();
})
.catch((e) =>
  console.log(e)
);

function showInstruction(){
  if(gameOrder[gameIndex]=="apple"){
    $instructionMsg.innerHTML = "This is the instruction for the apple game";
  } else {
    $instructionMsg.innerHTML = "This is the instruction for the birds game";
  }
  // const instruction = select('#instruction');
  // if(instruction.hasClass('hidden'))
  //   instruction.removeClass('hidden');
  document.querySelector('#instruction').style.display = "flex";
}

function startTask(){
  gameOn = true;
  document.querySelector('canvas').style.display = "block";
  document.querySelector('#instruction').style.display = "none";
  //decide which game to present
  gameMode = gameOrder[gameIndex];
  if(gameMode == 'birds'){
    initGame('birds');
  } else {
    if(Math.random()>0.5){
      initGame('sunLeft');
    }else{
      initGame('sunRight');
    }
  }
}

let myObjectNum = 10;
let myObjectSize = 134;

let myObjectX = [];
let myObjectY = [];
let apples = [];
let birds = [];
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
let sun;

let tree;
let object;
let object_shadow;

let showOrderNumbers = false;
let showThanks = false;

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
let instructionDiv;
let instructionMsg;
let startBtn;

window.preload = function() {
  // preload() runs once
  apple = loadImage("/images/apples/apple.png");
  apple_shadow = loadImage("/images/apples/apple_shadow.png");

  bg_sky = loadImage("/images/apples/tree.png");
  bg_sun_left = loadImage("/images/apples/tree.png");
  bg_sun_right = loadImage("/images/apples/tree.png");

  bird = loadImage("/images/apples/bird.png");
  bird_shadow = loadImage("/images/apples/bird_shadow.png");

  bg_menu = loadImage("/images/apples/tree.png");
  sun = loadImage("/images/apples/sun.png");
}

let ruFinishedBtn;

window.setup = function() {
  myCanvas = createCanvas(windowWidth, windowHeight);
  myObjectSize = windowWidth / myObjectNum;
  textSize(myObjectSize / 3);
  //make an instruction screen
  instructionDiv = select('#instruction');
  instructionMsg = select('#instructionMsg');
  ruFinishedBtn = select("#ruFinishedBtn");
  ruFinishedBtn.addClass('hidden');
}

window.draw = function() {
  if(gameOn) {
    if (gameMode != 'menu') {
      background(220);
      //draw the background
      image(tree, 0, 0, width, height);
      //if the game mode is one of the apples then draw the sun
      if(gameMode == 'sunLeft'){
        image(sun, 325, 15);
      } else if(gameMode == 'sunRight'){
        image(sun, 880, 15);
      }
      drawObjects();
      if (showOrderNumbers) {
        fill(230);
        textSize(myObjectSize / 3);
        text(dateAndTimeStarted + "\nTime Taken: " + round(timeTaken) + " secs", 40, windowHeight - myObjectSize);
        ellipseMode(CORNER);
        ellipse(width - myObjectSize, height - myObjectSize, myObjectSize / 2, myObjectSize / 2);
      }
    }
  }
}

// function setUpStartMenu() {
//   image(bg_menu, 0, 0, width, height);
//   gameMode = "menu";
//   let btn_sunLeft = createButton('Sun Left');
//   // btn_sunLeft.position(width*.3, height*.2);
//   btn_sunLeft.touchStarted(() => {
//     initGame('sunLeft');
//   });
//   btn_sunLeft.mousePressed(() => {
//     initGame('sunLeft');
//   });
//
//   btn_sunLeft.addClass('top');
//
//   let btn_sunRight = createButton('Sun Right');
//   // btn_sunRight.position(width*.3, height*.4);
//   btn_sunRight.touchStarted(() => {
//     initGame('sunRight');
//   });
//   btn_sunRight.mousePressed(() => {
//     initGame('sunRight');
//   });
//
//   btn_sunRight.addClass('middle');
//
//   let btn_birds = createButton('Bird Nest');
//   // btn_birds.position(width*.3, height*.6);
//   btn_birds.touchStarted(() => {
//     initGame('birds');
//   });
//   btn_birds.mousePressed(() => {
//     initGame('birds');
//   });
//
//
//   btn_birds.addClass('bottom');
// }

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
    console.log(myObjectSize, windowHeight);
    myObjectX[i] = i * myObjectSize;
    myObjectY[i] = windowHeight - myObjectSize * 1.3;
    console.log("apple "+i+": "+myObjectX[i]+", "+myObjectY[i]);
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
  showThanks = false;
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

    if (showThanks) {
      textSize(myObjectSize / 1.4);
      fill(0);
      text("Thanks!");
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

  console.log("order counter: "+orderCounter);

  if (orderCounter == myObjectNum && mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
    showOrderNumbers = !showOrderNumbers;
    // // for (let i = 0; i < myObjectNum; i++) {
    // //   hasMoved[j] = false;
    // //   noMoreMove[i] = false;
    // // }
    //
    // //game is all finished
    // //record the end time
    // //check if the end time has already been set
    // if (myTime.endTime == 0) {
    //   myTime.endTime = millis();
    //   console.log("end time: "+myTime.endTime);
    //   timeTaken = (myTime.endTime - myTime.startTime) * .001;
    // }
  }


  if (showOrderNumbers && mouseX < width && mouseX > width - myObjectSize && mouseY < height && mouseY > height - myObjectSize) {
    saveCanvas(myCanvas, dateAndTimeStarted + ".jpg");
    // bigReset();
    // setUpStartMenu();
  }

  //check if the game is finished
  if (orderCounter == myObjectNum && gameOn) {
    console.log("show r u finished button")
    //show are you finished screen
    if(ruFinishedBtn.hasClass('hidden'))
      setTimeout(ruFinished, 3000);
    // if(gameMode == "birds"){
    //   for(let i=0; i < myObjectX.length; i++){
    //     birds[i] = { x: myObjectX[i], y: myObjectY[i]};
    //   }
    //   sessionData.birds = {
    //     position: birds,
    //     startTime: dateAndTimeStarted,
    //     timeTaken: round(timeTaken)
    //   }
    // } else {
      //apple game has been finished
      //package data and reload the bird game
      // for(let i=0; i < myObjectX.length; i++){
      //   apples[i] = { x: myObjectX[i], y: myObjectY[i]};
      // }
      // sessionData.apples = {
      //   position: apples,
      //   startTime: dateAndTimeStarted,
      //   timeTaken: round(timeTaken)
      // }
    // }
  }

  return false;
}



function ruFinished(){
  ruFinishedBtn.removeClass('hidden');
  // btn_sunLeft.position(width*.3, height*.2);
  ruFinishedBtn.touchStarted(() => {
    //turn off the game
    gameOn = false;
    //decide if this task has been done
    if(gameIndex > 0){
      //all two tasks are finished
      //wrap it up
      finishGame();
    } else {
      //only the first game is finished
      //calculate the time
      if (myTime.endTime == 0) {
        myTime.endTime = millis();
        // console.log("end time: "+myTime.endTime);
        timeTaken = (myTime.endTime - myTime.startTime) * .001;
      }
      //restart the game with the next mode
      if(gameMode == "birds"){
        //if the current game mode was birds then package the current data before loading the new one
          for(let i=0; i < myObjectX.length; i++){
            birds[i] = { x: myObjectX[i], y: myObjectY[i]};
          }
          sessionData.birds = {
            position: birds,
            startTime: dateAndTimeStarted,
            timeTaken: round(timeTaken)
          }
      } else {
        // the current game is apples
        // apple game has been finished
        for(let i=0; i < myObjectX.length; i++){
          apples[i] = { x: myObjectX[i], y: myObjectY[i]};
        }
        sessionData.apples = {
          position: apples,
          startTime: dateAndTimeStarted,
          timeTaken: round(timeTaken)
        }
      }
      //increment the gameIndex
      gameIndex++;
      showInstruction();
      // gameMode = gameOrder[gameIndex];
      // if(gameMode == 'birds'){
      //   initGame('birds');
      // } else {
      //   if(Math.random()>0.5){
      //     initGame('sunLeft');
      //   }else{
      //     initGame('sunRight');
      //   }
      // }
    }
    //hide the button
    ruFinishedBtn.addClass('hidden');
  });
  ruFinishedBtn.mousePressed(() => {
    // initGame('birds');
  });
}

function finishGame() {
  const thanks = select("#thanks");
  thanks.removeClass("hidden");
  //turn off the game
  gameOn = false;
  //post the sessionData to the database
  //update the subject data
  currentSubject.tasks.three = 1;
  experiment.id = id;
  experiment.experiment = currentSubject;
  //update the database
  storeSubject.dispatch({
      type: "UPDATE_DATA",
      payload: {
        data: experiment
      }
  });
  //package the data
  sessionData.subject = experiment;
  //then store it to the storage which will post it to the database
  store.dispatch({
    type: "ADD_DATA",
    payload: {
      data: sessionData
    }
  });

  setTimeout(function() {
    window.location.href = "/"+"?subject="+currentSubject.subjectNum+"&id="+experiment.id+"&age="+currentSubject.age.year;
  }, 5000);
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
