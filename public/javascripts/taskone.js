//import the data storing script
import storeSubject from '/utils/subject_storage.js'
import store from '/utils/storage.js'
import {instructions} from '/instructions/task1/instructions.js'
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

const $instructionScreen = document.querySelector("#instructionContainer");
let instructionPages = [];
let instTexts = [];
let nextBtns = [];
const pathToSlides = "/instructions/task1/";

// let timeID;
let isGameOn = false;
//get the reference to the game view HTML elements
// const $startBtn = document.querySelector('#startBtn');
const $gameView = document.querySelector('#gameView');
//hide the thank you screen

const $gameContainer = document.querySelector('#game-container');
const $gameHUD = document.querySelector('#game-HUD');

let $choiceCards = document.querySelectorAll('.choice-card');
const $leftChoice = document.querySelector('#left');
const $rightChoice = document.querySelector('#right');
const $bunny = document.querySelector("#bunny");
// var $animation = document.getElementById("character");
// var $animContainer = document.getElementById("animContainer");
// $animation.style.visibility = "hidden";
let $canvas_carrot = document.querySelector("#canvas-carrot");
let $canvas_dirt = document.querySelector("#canvas-dirt");
let context_c = $canvas_carrot.getContext("2d");
let context_d = $canvas_dirt.getContext("2d");
let resolution = 1; //window.devicePixelRatio || 1;
let tl_c, tl_d;
let vw, vh, cx, cy;
let animationWidth = 250;
let animationHeight = 218;

const $feedback = document.querySelector('#feedback');

// const $clickArea = document.querySelector('#clickArea');

//these two are hidden but left here for added functionality for future
const $submitButton = document.querySelector('#submit');
const $playButton = document.querySelector('#playback');
// const $appHeader = document.querySelector('#app-header');
// const $gameUI = document.querySelector('#game-ui');
// const $instruction = document.querySelector('#instruction');
const $thanks = document.querySelector('.thanks');
const $thanksMsg = document.querySelector('#thanks-msg');
// set the language based on the language setting
// if(currentSubject.lang == "de"){
//   // $startBtn.innerHTML = "Starte das Spiel.";
//   $thanksMsg.innerHTML = "Vielen Dank für Ihre Teilnahme.";
//   // $instruction.innerHTML = 'Wird es eine Karotte geben oder nicht? Du musst raten!';
// }
//hide the thank you screen
$thanks.style.display = "none";
$thanks.style.opacity = 0;

let bunnyX = 160;
let bunnyY = 331;

setUpInstruction(instructions);

function setUpInstruction(arr){
  for(let i=0; i < arr.length; i++){
    const inst = arr[i];
    let $instruction = document.createElement("div");
    $instruction.classList.add('instructionWrapper');
    $instructionScreen.appendChild($instruction)

    if(inst.background!=null){
      $instruction.innerHTML += `<img class="background" src=${pathToSlides+inst.background}>`;
    }
    if(inst.foreground!=null){
      if(inst.isVideo == 1){
        //this is a video - make video
        let videlem = document.createElement("video");
        videlem.playsinline = true;
        videlem.muted = true;
        let sourceMP4 = document.createElement("source");
        sourceMP4.type = "video/mp4";
        sourceMP4.src = pathToSlides+inst.foreground;
        if (videlem) {
          videlem.play();
          videlem.pause();
        }
        videlem.appendChild(sourceMP4);
        if(inst.image_x && inst.image_y){
          videlem.style.left = inst.image_x;
          videlem.style.top = inst.image_y;
        }
        if(inst.image_width){
          videlem.style.width = inst.image_width;
        }
        $instruction.appendChild(videlem);
      } else {
        //this is not a video make an image element instead
        let foreImg = document.createElement('img');
        foreImg.src =  pathToSlides+inst.foreground;
        foreImg.classList.add('foreground');
        if(inst.image_x && inst.image_y){
          foreImg.style.left = inst.image_x;
          foreImg.style.top = inst.image_y;
        }
        if(inst.image_width){
          foreImg.style.width = inst.image_width;
        }
        $instruction.appendChild(foreImg);
      }
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
        if(inst.textAlign=="center"){
          //if center aligned then apply transform
          instructionText.style.transform = "translate(-50%, 0)";
          instructionText.style.left = inst.x;
        } else {
          instructionText.style.left = inst.x;
        }
        instructionText.style.top = inst.y;
        instructionText.style.textAlign = inst.textAlign;
      }
      instTexts.push(instructionText);
      // $instruction.innerHTML += `<div class="instruction">${inst.text.en}</div>`;
    }
    //make some buttons
    let nextBtn = document.createElement('div');
    if(i < arr.length-1){
      // not the last slide so make a next button
      nextBtn.classList.add('nextBtn');
    } else {
      //it's the last screen - put startGameButton
      nextBtn.classList.add('startGameButton');
      nextBtn.innerHTML = "Are you ready?"
    }

    $instruction.appendChild(nextBtn);
    nextBtns.push(nextBtn);
    instructionPages.push($instruction);
  }

  //now set up buttons
  for(let i=0; i < nextBtns.length; i++){
    nextBtns[i].addEventListener('click', function(){
      //if it's not the last screen button
      if(i < nextBtns.length-1){
        let delay = parseInt(arr[i+1].textDelay);
        // function fadeInInstruction(elem, duration, delay, func=null)
        fadeInInstruction(instructionPages[i+1], 1, 1, playVideo);
        fadeInInstruction(instTexts[i+1], 1, delay+1);
        fadeInInstruction(nextBtns[i+1], 1, delay+2);
        //now play animation if there's any
        if(instructions[i+1].animation != null){
          //get the foreground image
          const $elem = instructionPages[i+1].querySelector('img.foreground');
          const prop = arr[i+1].animation.property;
          const toVal = parseInt(arr[i+1].animation.to);
          const du = parseInt(arr[i+1].animation.duration);
          if(prop == "x"){
            gsap.to($elem, {
              x: toVal,
              duration: du
            });
          } if(prop == "y"){
            gsap.to($elem, {
              y: toVal,
              duration: du
            });
          }

        }

        if(instructions[i].imgfadeOut == 1){
          //if image needs to be faded out, then fade out the whole thing
          console.log("fade out the whole thing");
          fadeOut(instructionPages[i], true, 0);
        } else {
          //if image needs to stay, then just fade out the text and the button
          fadeOut(instTexts[i], true, 0);
          fadeOut(nextBtns[i], true, 0);
        }

      } else {
        //it's the last slide
        //the button should trigger start game
        fadeOut(instructionPages[i], true, 0);
        startTask();
      }
    })
  }
  //once all set, hide all
  for(let i=0; i < instructionPages.length; i++){
    instructionPages[i].style.display = "none";
    instructionPages[i].style.opacity = "0";
    instTexts[i].style.display = "none";
    instTexts[i].style.opacity = "0";
    nextBtns[i].style.display = "none";
    nextBtns[i].style.opacity = "0";
  }
}

function showInstruction(){

  //show the first slide
  // instructionPages[0].style.display = "block";
  fadeInInstruction(instTexts[0], 1, 1.5);
  fadeInInstruction(nextBtns[0], 1, 2.5);
  fadeInInstruction(instructionPages[0], 1, 0);
  fadeInInstruction($instructionScreen, 1, 0);
  // const instTexts = document.querySelectorAll('.instruction');
  // const nextBtns = document.querySelectorAll('div.nextBtn');
}

//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};
let currentSubject = {};
let currentSubjectID;
const totalCards = 41;
let currentCardNum = 0;
//make array for sequence set
var environment = [];
//array to store choices
var choices = [];
let choiceMode = 0;
//array to store if the choice is correct guess or not
var correct = [];
//array to store card DOM objects
var $cards = [];

const urlParams = new URLSearchParams(window.location.search);
const subjectNumParam = urlParams.get('subject');
const ageGroupParam = urlParams.get('age');
const id = urlParams.get('id');
let subjects = [];
let subjectNum;
let ageGroup;

// let sequenceSets = [];
let sequenceSetIndex;
let pValue;

//generate some fake sequenceSet for testing purpose
// for(let i=0; i < 50; i++){
//   let sequence = [];
//   for(let j=0; j < 41; j++){
//     sequence.push(Math.random() > 0.5 ? 1 : 0);
//   }
//   sequenceSets.push(sequence);
// }

const $game = document.querySelector('#content');
//make sure the game view is all hidden
$game.style.display = "none";
$game.style.opacity = 0;


document.body.addEventListener('touchstart', () => {
  document.activeElement.blur();
});

// fetch the subjectNumbers collection
async function fetchSubject(){
  let response = await fetch('/subjects');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

//fetch the subject from collection by its id
// getData('/single_subject/'+id)
//   .then((data) => {
//     console.log(data);
//     //let's do something with it.
//   });

async function fetchSubjectById(){
  let response = await fetch('/single_subject/'+id);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

//fetch the subject by the id then start
fetchSubjectById().then((data) => {
  console.log(data);
  if(subjectNumParam!=null){
    subjectNum = parseInt(subjectNumParam);
    ageGroup = parseInt(ageGroupParam);
    // //now do something with it
    currentSubject = data.experiment;
    //set the sequence based on the subjectNumber
    sequenceSetIndex = subjectNum-1;
    //set the choice cards mode based on the subject number
    //in this case we are just doing even / odd number
    choiceMode = subjectNum%2==0 ? 0 : 1;
    //set the choice card
    let left, right;
    if(choiceMode == 0){
      left = 0;
      right = 1;
    } else {
      left = 1;
      right = 0;
    }
    //show the choice cards but they are not clickable yet
    document.querySelector("#left").setAttribute('data-choice', left);
    document.querySelector("#right").setAttribute('data-choice', right);
    document.querySelector("#left").classList.remove('activeChoiceCard');
    document.querySelector("#right").classList.remove('activeChoiceCard');
    document.querySelector('#game-HUD').style.display = "flex";
    document.querySelector('#game-HUD').style.opacity = "1";

    // pValue = sequence[parseInt(sequenceSet) - 1][41];
    pValue = 1;
    // //load the page content
    //now set up the game
    setUpGame();
    //fade in the instruction screen
    // fadeIn($instruction, 1);
    //Fade in the game screen
    showInstruction();
    // fadeIn($game, 1);
  }
}).catch((e) =>
  console.log(e)
);

function startTask(){
  for(let i=0; i < instructionPages.length-1; i++){
    instructionPages[i].style.display = "none";
    instructionPages[i].style.opacity = "0";
    instTexts[i].style.display = "none";
    instTexts[i].style.opacity = "0";
    nextBtns[i].style.display = "none";
    nextBtns[i].style.opacity = "0";
  }
  fadeOut($instructionScreen, true, 0);
  fadeIn($game, 1, 1);

  moveUpBunny();
}

function setUpGame() {

  setUpGameBoard();
  setFirstBunny();
  // showOptions();
  fadeIn($bunny,1, 0.5);
  // revealFirstCard();

  //make sure the game view is 100% of the screen height
  // $gameView.style.height = window.innerHeight + "px";

  //if startbutton is clicked
  // $startBtn.addEventListener('click', function(e) {
  //   e.preventDefault();
  //   //fade out the game ui
  //   fadeOut($gameUI, true);
  //   $gameUI.style.pointerEvents = "none";
  //   // //make sure the gameHUD is clickable
  //   // $gameHUD.style.pointerEvents = "auto";
  //   //move the bunny to the next position

  // })

}
//set up gameboard
function setUpGameBoard() {
  let col = 0;
  let row = 0;
  let x, y;

  //load the sequence to the environment variable
  for (let i = 0; i < totalCards; i++) {
    //get the sequence from the sequence set
    let env = sequenceSets[sequenceSetIndex][i]
    environment.push(env);
  }

  //lay out the card
  for (let i = 0; i < totalCards; i++) {
    //get the sequence from the sequence set
    let env = environment[i];

    //this is the test set up//
    // if (x > 1000) {
    //   col = 1;
    //   row++;
    // }
    //
    // x = (cardWidth) * col + 20;
    // y = row * (cardWidth) + 10;
    // col++;
    ///////////////////////////

    //get the card positions from the json file//
    x = cardPositions[i].x;
    y = cardPositions[i].y;

    let $card = drawBGCard({
      x: x,
      y: y,
      env: env,
      id: i
    });
    $cards.push($card);
  }
}

function setUpBunny() {
  let $current = $cards[currentCardNum];
  let bunnyPosition = $current.getBoundingClientRect();
  // console.log($current);
  let x = bunnyPosition.x;
  let y = bunnyPosition.y;
  drawBunny({
    x,
    y
  });
}

function moveUpBunny() {
  let $current = $cards[currentCardNum];
  let nextBunnyPosition = $current.getBoundingClientRect();
  let currentBunnyPosition = $bunny.getBoundingClientRect();
  // console.log($current);
  let x = nextBunnyPosition.x + nextBunnyPosition.width / 2 - bunnyX;
  let y = nextBunnyPosition.y + nextBunnyPosition.height / 2 - bunnyY*1.6;
  let duration = 1;
  let delay = 2;
  let transition = "skipRight";
  if(nextBunnyPosition.x > currentBunnyPosition.x){
    transition = "skipRight";
  } else {
    transition = "skipLeft";
  }
  moveBunny({
    x,
    y,
    duration,
    delay,
    transition
  });
}

function moveBunny(options) {
  let onStartFunc = function(){
    let className = "bunny-" + options.transition;
    $bunny.classList.add(className);
    $bunny.classList.remove("bunny-waitingLeft");
  }
  gsap.to(".bunny", {
    x: options.x,
    y: options.y,
    duration: options.duration,
    delay: options.delay,
    onStart: onStartFunc,
    onComplete: fadeInButtons
  });
}

function moveNext() {
  //move the bunny to the next position
  //change the current $card
  if (currentCardNum == totalCards - 1) {
    moveAnimation();
    finishGame();
  } else {
    //move the animation to the right position
    moveAnimation();
    revealCard();
    currentCardNum++;
    moveUpBunny();
  }
}

function moveAnimation() {
  let $current;
  $current = $cards[currentCardNum];
  let animPosition = $current.getBoundingClientRect();
  // console.log($current);
  let x = animPosition.x + animPosition.width / 2;
  let y = animPosition.y + animPosition.height / 2;

  $canvas_carrot.style.pointerEvents = "none";
  $canvas_carrot.style.top = y + "px";
  $canvas_carrot.style.left = x + "px";
  $canvas_carrot.style.visibility = "hidden";

  $canvas_dirt.style.pointerEvents = "none";
  $canvas_dirt.style.top = y + "px";
  $canvas_dirt.style.left = x + "px";
  $canvas_dirt.style.visibility = "hidden";
  // $animContainer.style.transform = "translate(-50%, -50%)";
}

function setFirstBunny() {
  drawBunny({
    x: bunnyX,
    y: bunnyY
  });
}

function revealCard() {
  const index = $cards[currentCardNum].dataset.index;
  //get the environment
  const env = environment[parseInt(index)];
  const ch = choices[choices.length - 1];
  // console.log("env: " + env + ", choice: " + ch);
  if (env == ch) {
    $feedback.innerHTML = "Correct!";
    correct = [...correct, 1];
  } else {
    correct = [...correct, 0];
    $feedback.innerHTML = "Oops, there was ";
    if (env == 0) {
      $feedback.innerHTML += "no carrot!";
    } else {
      $feedback.innerHTML += "a carrot!";
    }
  }

  //flip animation goes here
  //set up the animation
  //make sure the animation has a baked in delay at the beginning to
  //account for the button push time.
  $cards[currentCardNum].style.visibility = "hidden";
  $cards[currentCardNum].setAttribute('data-env', env);
  //hide the current card
  playAnimation(env);
}

function generateNextOptions() {
  //show the cards
  // $gameHUD.style.opacity = 1;
  //to do tomorrow!!!!
  //this needs to happen after the cards are completely faded out
  // let r = Math.random();
  // let left = r > 0.5 ? 1 : 0;
  // let right = r > 0.5 ? 0 : 1;
  let left, right;
  if(choiceMode == 0){
    left = 0;
    right = 1;
  } else {
    left = 1;
    right = 0;
  }
  $leftChoice.setAttribute('data-choice', left);
  $rightChoice.setAttribute('data-choice', right);
  $leftChoice.classList.remove('activeChoiceCard');
  $rightChoice.classList.remove('activeChoiceCard');
  // $leftChoice.classList.remove('disabledChoiceCard');
  // $rightChoice.classList.remove('disabledChoiceCard');

}

function drawBGCard(options, fadeOut = true, remove = true) {
  const card = document.createElement('div');
  card.classList.add('bgCard');
  if (options.id == currentCardNum) {
    card.classList.add('currentCard');
  } else {
    card.classList.remove('currentCard');
  }

  // card.innerHTML = options.env;
  card.style.pointerEvents = "none";
  $gameContainer.append(card);
  card.style.top = options.y + "px";
  card.style.left = options.x + "px";
  card.style.transform = "translate(-50%, -50%)";
  //card.style.opacity = 0.6;
  // card.style.transform = "scale(0.6,0.6)"
  card.setAttribute('data-index', options.id);
  return card;
}

function drawBunny(options) {
  $bunny.style.pointerEvents = "none";
  $bunny.style.top = options.y + "px";
  $bunny.style.left = options.x + "px";
  $bunny.style.transform = "translate(-50%, -50%)";
  // card.style.opacity = 0.6;
  // card.style.transform = "scale(0.6,0.6)"
}

//event listeners
$choiceCards.forEach(function(userItem) {
  userItem.addEventListener('touchstart', function(e) {
    e.preventDefault();
    $gameHUD.style.pointerEvents = "none";
    // console.log("current card number: " + currentCardNum);
    if (currentCardNum <= totalCards - 1) {
      let choice = e.target.dataset.choice;
      // console.log("choice: " + choice);
      choices = [...choices, parseInt(choice)];
      //choices.push[choice];
      console.log("choice has been made: " + choice );
      //add the class to the activeChoiceCard
      //don't forget to remove this when you generate the card
      e.target.classList.add("activeChoiceCard");

      moveNext();
      //todo///////////////////////////////////
      //make the click feedback animation here
      gsap.fromTo(e.target, 0.3, {y:0},{
        y:10,
        yoyo: true,
        repeat:1,
        onComplete: fadeOutShowOptions
      })
      //then fade out the buttons
      //fadeOut($gameHUD, false, 1);
      ////////////////////////////////////////
      // showFeedback();
    } else {
      //finish the game;
    }
  })
});

function fadeInButtons(){
  // fadeIn($gameHUD, 0.3, 0, "flex");
  fadeInGameHUD();
  //put the bunny into the neutral position
  $bunny.classList.remove("bunny-skipRight");
  $bunny.classList.remove("bunny-skipLeft");
  console.log(currentCardNum);
  if(currentCardNum <= 27 && currentCardNum >= 13){
    $bunny.classList.add("bunny-waitingLeft");
  } else {
    $bunny.classList.remove("bunny-waitingLeft");
  }
  //draw some border around the card
  // $cards[currentCardNum - 1].classList.remove('currentCard');
  // $cards[currentCardNum].classList.add('currentCard');
}

function fadeInGameHUD(){
  $gameHUD.style.display = "flex";
  //elem.style.opacity = 0;
  gsap.to($gameHUD, {
    duration: 0.3,
    ease: "power1.inOut",
    opacity: 1,
    delay: 0.3,
    onComplete: enableChoiceButtons
  });
}

function enableChoiceButtons(){
  $gameHUD.style.pointerEvents = "auto";
  $leftChoice.classList.remove('activeChoiceCard');
  $rightChoice.classList.remove('activeChoiceCard');
  $leftChoice.classList.remove('disabledChoiceCard');
  $rightChoice.classList.remove('disabledChoiceCard');
}

function fadeOutButtons(elem){
  //fadeOut($gameHUD, false);
  if(currentCardNum < totalCards - 1)
  {
    fadeOutShowOptions(elem);
  }
}

function fadeOutShowOptions() {
  //instead of fading it out
  // make it look disabled

  gsap.to($gameHUD, {
    duration: 0.5,
    delay: 1.5,
    ease: "power1.inOut",
    opacity: 1.0,
    onComplete: generateNextOptions,
    onStart:disableChoiceCards
  });
}

function disableChoiceCards() {
  document.querySelector("#left").classList.remove('activeChoiceCard');
  document.querySelector("#right").classList.remove('activeChoiceCard');
  document.querySelector("#left").classList.add('disabledChoiceCard');
  document.querySelector("#right").classList.add('disabledChoiceCard');
}

function showFeedback() {
  fadeIn($feedback, 1);
  fadeOut($feedback, false, 0.5)
}

function hideAnimation(elem1, elem2) {
  elem1.style.visibility = "hidden";
  elem2.style.visibility = "visible";
}
//animation codes
resize($canvas_dirt);
resize($canvas_carrot);

let carrot = {
  rotation: 0,
  frame: 0,
  x: -animationWidth / 2,
  y: -animationHeight / 2
};

let dirt = {
  rotation: 0,
  frame: 0,
  x: -animationWidth / 2,
  y: -animationHeight / 2
};

let sprite_c = new Image();
sprite_c.onload = initCarrot;
sprite_c.src = "animations/cards/yellowCarrot.png";

let sprite_d = new Image();
sprite_d.onload = initDirt;
sprite_d.src = "animations/cards/yellowDirt.png";

// window.addEventListener("resize", resizeCarrot);

function initCarrot() {
  tl_c = gsap.timeline({ onUpdate: updateCarrot, onComplete: carrotFinished, paused:true })
    .to(carrot, { frame: carrot_frames.length - 1, roundProps: "frame", repeat: 0, ease: "none", duration: 1, delay:0.5 }, 0);
  // tl_c.pause();
}

function initDirt() {
  tl_d = gsap.timeline({ onUpdate: updateDirt, onComplete: dirtFinished, paused:true })
      .to(dirt, { frame: dirt_frames.length - 1, roundProps: "frame", repeat: 0, ease: "none", duration: 1, delay:0.5 }, 0);
  // tl_d.pause();
}

function updateCarrot() {

  let frame = carrot_frames[carrot.frame];

  let f = frame.frame;
  let s = frame.spriteSourceSize;
  // let r = frame.rotated;

  let x = carrot.x + s.x;
  let y = carrot.y + s.y;

  // console.log(f);

  context_c.save();
  context_c.clearRect(0, 0, vw, vh);
  context_c.translate(cx, cy);
  context_c.drawImage(sprite_c, f.x, f.y, f.w, f.h, x, y, f.w, f.h);
  context_c.restore();
}

function updateDirt() {

  let frame = dirt_frames[dirt.frame];

  let f = frame.frame;
  let s = frame.spriteSourceSize;
  // let r = frame.rotated;

  let x = dirt.x + s.x;
  let y = dirt.y + s.y;

  // console.log(f);

  context_d.save();
  context_d.clearRect(0, 0, vw, vh);
  context_d.translate(cx, cy);
  context_d.drawImage(sprite_d, f.x, f.y, f.w, f.h, x, y, f.w, f.h);
  context_d.restore();
}

function carrotFinished(){
  console.log("carrot finished");
  const index = $cards[currentCardNum-1].dataset.index;
  // //get the environment
  const env = environment[parseInt(index)];
  $canvas_carrot.style.visibility = "hidden";

  if(currentCardNum == 0) {
    $cards[0].style.visibility = "visible";
  } else {
    $cards[currentCardNum - 1].setAttribute('data-env', env);
    $cards[currentCardNum - 1].style.visibility = "visible";
  }

}

function dirtFinished(){
  console.log("dirt finished");
  const index = $cards[currentCardNum-1].dataset.index;
  // //get the environment
  const env = environment[parseInt(index)];
  $canvas_dirt.style.visibility = "hidden";
  if(currentCardNum == 0) {
    $cards[0].style.visibility = "visible";
  } else {
    $cards[currentCardNum - 1].setAttribute('data-env', env);
    $cards[currentCardNum - 1].style.visibility = "visible";
  }
}

function resize(canvas) {
  vw = animationWidth;
  vh = animationHeight;

  cx = vw / 2;
  cy = vh / 2;

  canvas.width  = vw * resolution;
  canvas.height = vh * resolution;

  canvas.style.width  = vw + "px";
  canvas.style.height = vh + "px";

  canvas.getContext("2d").scale(resolution, resolution);
  // console.log(resolution)
}

function playAnimation(mode) {
  if(mode==1) {
    tl_c.restart();
    // canvas_carrot.style.display = "block";
    $canvas_carrot.style.visibility = "visible";
  } else {
    tl_d.restart();
    // canvas_dirt.style.display = "block";
    $canvas_dirt.style.visibility = "visible";
  }
}

function showAnimation(){
  if(Math.random() < 0.5){
    playAnimation(1);
  }else{
    playAnimation(0);
  }
}

function finishGame() {
  //make sure we stop the timer if it's been created
  // if (timeID)
  //   clearTimeout(timeID);
  isGameOn = false;
  currentCardNum++;
  const index = $cards[currentCardNum - 1].dataset.index;
  //get the environment
  const env = environment[parseInt(index)];
  const ch = choices[choices.length - 1];
  // console.log("env: " + env + ", choice: " + ch);
  if (env == ch) {
    $feedback.innerHTML = "Correct!";
    correct = [...correct, 1];
  } else {
    correct = [...correct, 0];
    $feedback.innerHTML = "Oops, there was ";
    if (env == 0) {
      $feedback.innerHTML += "no carrot!";
    } else {
      $feedback.innerHTML += "a carrot!";
    }
  }

  console.log("last env "+env);

  $cards[totalCards-1].setAttribute('data-env', env);
  //hide the last card
  $cards[totalCards-1].style.visibility = "hidden";
  //flip animation goes here
  if(currentCardNum > 1 ) {
    playAnimation(env);
  }

  console.log("game finished");
  //update the subject data
  currentSubject.tasks.one = 1;
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
  sessionData = {
    "subject": experiment,
    "pValue": pValue,
    "sequenceSetIndex": sequenceSetIndex,
    "environment": environment,
    "choices": choices,
    "correct": correct
  }
  //log the data
  // console.log(sessionData.length);
  //put the dots to the experiment object
  //then store it to the storage which will post it to the database
  store.dispatch({
    type: choices.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
    payload: {
      data: sessionData
    }
  });

  //empty-reset the choices array
  choices = [];
  correct = [];

  console.log("data logged");
  //fade in the thank you with half second delay
  fadeIn($thanks, 1, 1.5);

  setTimeout(function() {
    window.location.href = "/"+"?subject="+currentSubject.subjectNum+"&id="+experiment.id+"&age="+currentSubject.age.year;
  }, 5000);
  // gsap.from('.sun', {y:200, duration:2.5, ease:"elastic.out(1, 0.3)", delay:1})
  // gsap.to('.sun',{filter:"blur(0px)", scale:1.2, repeat:-1, yoyo:true, duration:1});
  // gsap.from($gameUI, {opacity:0, duration:1});
}
////////////
//some utility functions for fading in and out using Greensock animation library (GSAP)
function fadeIn(elem, duration, delay, display = "block") {
  elem.style.display = display;
  //elem.style.opacity = 0;
  gsap.to(elem, {
    duration: duration,
    ease: "power1.inOut",
    opacity: 1,
    delay: delay,
    onComplete: enable,
    onCompleteParams: [elem]
  });
}

function fadeInInstruction(elem, duration, delay, func=null){
  elem.style.display = "block";
  //elem.style.opacity = 0;
  gsap.to(elem, {
    duration: duration,
    ease: "power1.inOut",
    opacity: 1,
    delay: delay,
    onComplete: func,
    onCompleteParams: [elem]
  });
}

function playVideo(elem){
  //see if there's any video
  const vid = elem.querySelector('video');
  if(vid && vid.paused){
    vid.play();
  }
}

function fadeOut(elem, hide, delay = 0) {
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

function enable(elem) {
  elem.style.pointerEvents = "auto";
}

function mapRange(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
