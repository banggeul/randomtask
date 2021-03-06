import storeSubject from '/utils/subject_storage.js'
import store from '/utils/apple_storage.js'
import {apple_instructions, bird_instructions} from '/instructions/task3/instructions.js'
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
const $instructionScreen = document.querySelector("#instructionContainer");
let apple_instructionPages = [];
let bird_instructionPages = [];
let apple_instTexts = [];
let bird_instTexts = [];
let appleNextBtns = [];
let birdNextBtns = [];
const pathToSlides = "/instructions/task3/"

//first thing first,
//set up instructions
setUpInstruction(apple_instructions);
setUpInstruction(bird_instructions);

function showInstruction(){

  //if there's a canvas
  if(document.querySelector('canvas')){
    fadeOut(document.querySelector('canvas'));
  }

  if (gameOrder[gameIndex] == "apple") {
    for(let i=0; i < apple_instructionPages.length; i++){
      $instructionScreen.appendChild(apple_instructionPages[i]);
    }
    apple_instructionPages[0].style.display = "block";
    if(apple_instTexts.length > 0){
      fadeIn(apple_instTexts[0], 0);
      fadeIn(appleNextBtns[0], 1);
    }

  } else {
    for(let i=0; i < bird_instructionPages.length; i++){
      $instructionScreen.appendChild(bird_instructionPages[i]);
    }
    bird_instructionPages[0].style.display = "block";
    if(bird_instTexts.length > 0){
      fadeIn(bird_instTexts[0], 0);
      fadeIn(birdNextBtns[0], 1);
    }
  }

  fadeIn($instructionScreen, 0, null);
  // const instTexts = document.querySelectorAll('.instruction');
  // const nextBtns = document.querySelectorAll('div.nextBtn');

}

// function showInstruction() {
//   if (gameOrder[gameIndex] == "apple") {
//     $instructionMsg.innerHTML = "This is the instruction for the apple game";
//   } else {
//     $instructionMsg.innerHTML = "This is the instruction for the birds game";
//   }
//   // const instruction = select('#instruction');
//   // if(instruction.hasClass('hidden'))
//   //   instruction.removeClass('hidden');
//   document.querySelector('#instruction').style.display = "flex";
// }

function setUpInstruction(arr){
  let instructionPages = [];
  let instTexts = [];
  let nextBtns = [];

  for(let i=0; i < arr.length; i++){
    const inst = arr[i];
    let $instruction = document.createElement("div");
    $instruction.classList.add('instructionWrapper');
    // $instructionScreen.appendChild($instruction)
    if(inst.background!=null && inst.isVideo!=1){
      $instruction.innerHTML += `<img src=${pathToSlides+inst.background}>`;
    }
    if(inst.bgColor!=null){
      $instruction.style.backgroundColor = inst.bgColor;
    }
    if(inst.text!=null){
      let instructionText = document.createElement('div');
      instructionText.classList.add('instruction');
      instructionText.innerHTML = inst.text.en;
      $instruction.appendChild(instructionText);

      if(inst.x != null && inst.y != null && inst.textAlign != null) {
        if(i == arr.length-1){
          //last slide apply transform
          instructionText.style.transform = "translate(-50%, 0)";
          instructionText.style.left = inst.x;
        } else {
          instructionText.style.right = inst.x;
        }
        instructionText.style.top = inst.y;
        instructionText.style.textAlign = inst.textAlign;
      }


      instTexts.push(instructionText);
      // $instruction.innerHTML += `<div class="instruction">${inst.text.en}</div>`;
    }
    //not the last screen, so put the next button
    let nextBtn = document.createElement('div');
    if(i < arr.length-1){
      // $instruction.innerHTML += `<div class="nextBtn"></div>`;
      nextBtn.classList.add('nextBtn');
    } else {
      //it's the last screen - put startGameButton
      nextBtn.classList.add('startGameButton');
      nextBtn.innerHTML = "Let's Start!"
    }
    $instruction.appendChild(nextBtn);
    nextBtns.push(nextBtn);
    instructionPages.push($instruction);
  }
  // const nextBtns = document.querySelectorAll('div.nextBtn');
  // const instTexts = document.querySelectorAll('div.instruction');
  //now set up buttons
  for(let i=0; i < nextBtns.length; i++){
    nextBtns[i].addEventListener('click', function(){
      //if it's not the last screen button
      if(i < nextBtns.length-1){
        let delay = parseInt(arr[i+1].textDelay);
        fadeIn(instructionPages[i+1]);
        fadeIn(instTexts[i+1], delay);
        fadeIn(nextBtns[i+1], delay+1);
        fadeOutDelay(instructionPages[i], delay, true);
      } else {
        //it's the last slide
        //the button should trigger start game
        fadeOutDelay(instructionPages[i], 0, true);
        startTask();
      }
    })
  }
  //once all set, hide all
  for(let i=0; i < instructionPages.length; i++){
    instructionPages[i].style.display = "none";
  }

  if(arr[0].mode == "apple"){
    apple_instructionPages = instructionPages;
    apple_instTexts = instTexts;
    appleNextBtns = nextBtns;
  }else{
    bird_instructionPages = instructionPages;
    bird_instTexts = instTexts;
    birdNextBtns = nextBtns;
  }
}

// fetch the subjectNumbers collection
async function fetchSubject() {
  let response = await fetch('/subjects');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchSubjectById() {
  let response = await fetch('/single_subject/' + id);
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
    console.log(currentSubject.lang);
    //swap out all the instruction if this is german
    if(currentSubject.lang == "de"){
      //say german
      for(let i=0; i < instTexts.length; i++){
        if(instructions[i].text.de != null){
          instTexts[i].innerHTML = instructions[i].text.de;
        }
      }
    }
    //set the game order based on the subjecNum
    if (subjectNum % 2 == 0) {
      gameOrder = ["apple", "birds"];
      // $instructionMsg.innerHTML = "This is the instruction for the apple game";
    } else {
      gameOrder = ["birds", "apple"];
      // $instructionMsg.innerHTML = "This is the instruction for the birds game";
    }
    //but for now just set it as the first one
    // document.querySelector('#startBtn').addEventListener('touchstart', startTask);
    //show instruction
    showInstruction();
  })
  .catch((e) =>
    console.log(e)
  );

function startTask() {
  gameOn = true;
  fadeIn(document.querySelector('canvas'));
  fadeOut(document.querySelector('#instructionContainer'));
  // document.querySelector('canvas').style.display = "block";
  // document.querySelector('#instructionContainer').style.display = "none";
  //decide which game to present
  gameMode = gameOrder[gameIndex];
  if (gameMode == 'birds') {
    initGame('birds');
  } else {
    initGame('sunLeft');
  }
}


let myObjectNum = 10;
let myObjectSize = 80;

let myObjectX = [];
let myObjectY = [];
let myObjects = [];

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
// let instructionMsg;
let startBtn;

window.preload = function() {
  // preload() runs once
  // apple = loadImage("/images/apples/apple.png");
  // apple_shadow = loadImage("/images/apples/apple_shadow.png");
  apple = loadImage("/images/apples/apple_small.png");
  apple_shadow = loadImage("/images/apples/apple_shadow_small.png");

  bg_sky = loadImage("/images/apples/tree.png");
  bg_sun_left = loadImage("/images/apples/tree.png");
  bg_sun_right = loadImage("/images/apples/tree.png");

  bird = loadImage("/images/apples/bird_small.png");
  bird_shadow = loadImage("/images/apples/bird_shadow_small.png");

  bg_menu = loadImage("/images/apples/tree.png");
  sun = loadImage("/images/apples/sun.png");
}

let ruFinishedBtn;

window.setup = function() {
  myCanvas = createCanvas(windowWidth, windowHeight);
  myObjectSize = windowWidth / myObjectNum;
  textSize(myObjectSize / 3);
  //make an instruction screen
  // instructionDiv = select('#instruction');
  // instructionMsg = select('#instructionMsg');
  ruFinishedBtn = select("#ruFinishedBtn");
  ruFinishedBtn.addClass('hidden');
}

window.draw = function() {
  if (gameOn) {
    if (gameMode != 'menu') {
      background(220);
      //draw the background
      image(tree, 0, 0, width, height);
      //if the game mode is one of the apples then draw the sun
      if (gameMode == 'sunLeft') {
        image(sun, 325, 15);
      } else if (gameMode == 'sunRight') {
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
    myObjects[i] = {};
    myObjects[i].x = i * myObjectSize;
    myObjects[i].y = windowHeight - myObjectSize;
    // myObjects[i].y = windowHeight - myObjectSize * 1.3;

    // myObjectX[i] = i * myObjectSize;
    // myObjectY[i] = windowHeight - myObjectSize * 1.3;
    console.log(gameMode + i + ": " + myObjects[i].x + ", " + myObjects[i].y);

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
      image(object, myObjects[i].x, myObjects[i].y, myObjectSize, myObjectSize);
      // image(object, myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);
    } else {
      image(object_shadow, myObjects[i].x, myObjects[i].y, myObjectSize, myObjectSize);
      // image(object_shadow, myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);
    }
    noFill();
    //rect(myObjectX[i], myObjectY[i], myObjectSize, myObjectSize);

    if (showOrderNumbers) {
      textSize(myObjectSize / 1.4);
      fill(0);
      // text(myOrder[i], myObjectX[i] + 2 + myObjectSize * .35, myObjectY[i] + 3 + myObjectSize * .8);
      text(myOrder[i], myObjects[i].x + 2 + myObjectSize * .35, myObjects[i].y + 3 + myObjectSize * .8);
      textSize(myObjectSize / 1.45);
      fill(220, 220, 255);
      text(myOrder[i], myObjects[i].x + myObjectSize * .35, myObjects[i].y + myObjectSize * .8);
      // text(myOrder[i], myObjectX[i] + myObjectSize * .35, myObjectY[i] + myObjectSize * .8);
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
  if(!gameOn)
    return;
  for (let i = 0; i < myObjectNum; i++) {
    // if (myObjectY[i] < height * 0.57) {
    if (myObjects[i].y < height * 0.57) {
      onTree[i] = true;
    } else {
      onTree[i] = false;
    }
  }
}

function checkTouchOver() {
  if(!gameOn)
    return;

  for (let i = 0; i < myObjectNum; i++) {
    // if (
    //   mouseX > myObjectX[i] &&
    //   mouseX < myObjectX[i] + myObjectSize &&
    //   mouseY > myObjectY[i] &&
    //   mouseY < myObjectY[i] + myObjectSize
    // ) {
    //   overMyObject[i] = true;
    // } else {
    //   overMyObject[i] = false;
    // }
    if (
      mouseX > myObjects[i].x &&
      mouseX < myObjects[i].x + myObjectSize &&
      mouseY > myObjects[i].y &&
      mouseY < myObjects[i].y + myObjectSize
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

  if(myObjects.length < 1 || !gameOn)
    return;

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
    xOffset[i] = mouseX - myObjects[i].x;
    yOffset[i] = mouseY - myObjects[i].y;
  }

  console.log("order counter: " + orderCounter);

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
    if (ruFinishedBtn.hasClass('hidden'))
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



function ruFinished() {
  // ruFinishedBtn.removeClass('hidden');
  fadeIn(document.querySelector("#ruFinishedBtn"), 0)
  // btn_sunLeft.position(width*.3, height*.2);
  ruFinishedBtn.touchStarted(() => {
    //turn off the game
    gameOn = false;
    //decide if this task has been done
    if (gameIndex > 0) {
      //all two tasks are finished
      //wrap it up
      //save the game data
      if (gameMode == "birds") {
        //if the current game mode was birds then package the current data before loading the new one
        for (let i = 0; i < myObjects.length; i++) {
          birds[i] = {
            x: myObjects[i].x,
            y: myObjects[i].y,
            order: myOrder[i]+1,
            originalOrder: i+1
          };
        }
        sessionData.birds = {
          position: birds,
          startTime: dateAndTimeStarted,
          timeTaken: round(timeTaken)
        }
      } else {
        // the current game is apples
        // apple game has been finished
        for (let i = 0; i < myObjects.length; i++) {
          apples[i] = {
            x: myObjects[i].x,
            y: myObjects[i].y,
            order: myOrder[i]+1,
            originalOrder: i+1
          };
        }
        sessionData.apples = {
          position: apples,
          startTime: dateAndTimeStarted,
          timeTaken: round(timeTaken)
        }
      }
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
      //save the data
      if (gameMode == "birds") {
        //if the current game mode was birds then package the current data before loading the new one
        for (let i = 0; i < myObjects.length; i++) {
          birds[i] = {
            x: myObjects[i].x,
            y: myObjects[i].y,
            order: myOrder[i]+1,
            originalOrder: i+1
          };
        }
        sessionData.birds = {
          position: birds,
          startTime: dateAndTimeStarted,
          timeTaken: round(timeTaken)
        }
      } else {
        // the current game is apples
        // apple game has been finished
        for (let i = 0; i < myObjects.length; i++) {
          apples[i] = {
            x: myObjects[i].x,
            y: myObjects[i].y,
            order: myOrder[i]+1,
            originalOrder: i+1
          };
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
    // ruFinishedBtn.addClass('hidden');
    fadeOut(document.querySelector("#ruFinishedBtn"), 0.5, true);
  });
  ruFinishedBtn.mousePressed(() => {
    // initGame('birds');
  });
}

function finishGame() {
  const thanks = document.querySelector("#thanks");
  // thanks.removeClass("hidden");
  fadeIn(thanks, 1);
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
  sessionData.gameOrder = gameOrder;
  //then store it to the storage which will post it to the database
  store.dispatch({
    type: "ADD_DATA",
    payload: {
      data: sessionData
    }
  });

  setTimeout(function() {
    window.location.href = "/" + "?subject=" + currentSubject.subjectNum + "&id=" + experiment.id + "&age=" + currentSubject.age.year;
  }, 3000);
}

window.touchMoved = function() {
  if(myObjects.length < 1 || !gameOn)
    return;
  for (let i = myObjectNum - 1; i >= 0; i--) {
    if (!noMoreMove[i] && isMoving[i]) {
      myObjects[i].x = mouseX - xOffset[i];
      myObjects[i].y = mouseY - yOffset[i];
      break;
    }
  }
  // console.log(mouseX, mouseY);
  return false;
}

window.touchEnded = function() {
  if(myObjects.length < 1 || !gameOn)
    return;
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

function fadeIn(elem, delay, func=null) {
  elem.style.display = "block";
  elem.style.opacity = 0;
  gsap.to(elem, {
    duration: 1,
    ease: "power1.inOut",
    opacity: 1,
    delay: delay,
    onComplete:func
  });
}

function fadeOut(elem, duration, hide) {
  gsap.to(elem, {
    duration: duration,
    ease: "power1.inOut",
    opacity: 0,
    onComplete: hide ? hideElem : null,
    onCompleteParams: [elem]
  });
}

function fadeOutDelay(elem, delay, hide) {
  gsap.to(elem, {
    duration: 1,
    delay: delay,
    ease: "power1.inOut",
    opacity: 0,
    onComplete: hide ? hideElem : null,
    onCompleteParams: [elem]
  });
}

function hideElem(elem) {
  elem.style.display = "none";
}
