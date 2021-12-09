//import the data storing script
import storeSubject from '/utils/subject_storage.js'
import store from '/utils/rain_storage.js'
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
//create an empty array to store the user's choices
let dots = [];
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

//get the reference to the HTML elements we need
const $getUserContext = document.querySelector('#collectUserContext');
const $welcomeScreen = document.querySelector('.container');
const $instructionScreen = document.querySelector('#instructionContainer');
const $setTimeLimit = document.querySelector('#timeLimitSwitch');
const $timeLimit = document.querySelector('#timeLimitRow');
const $game = document.querySelector('#content');
const $startBtn = document.querySelector('#startBtn');
const $startBtnContainer = document.querySelector('#startBtnContainer');
//task settings
const clickLimit = 50;
const timeLimitOn = false;
const timeLimit = timeLimitOn ? 20 : -1;

let instructionPages = [];
const pathToSlides = "/instructions/task2/"
//first thing first,
//set up instructions
setUpInstruction();

//get the reference to the video
var video = document.querySelector("video");
//if video exists, pause it for now
if (video) {
  video.play();
  video.pause();
}

document.body.addEventListener('touchstart', () => {
  document.activeElement.blur();
});

//watch for the click event for the toggle button for the time limit switch
$setTimeLimit.addEventListener('click', function() {
  //if the time limit is on
  if (this.checked) {
    // console.log("time limit is on");
    //then show the time limit set form
    fadeIn($timeLimit);
  } else {
    // console.log("off");
    //if it's turned off, hide the time limit form
    fadeOut($timeLimit, 0.5, true);
  }
})

// fetch the subjectNumbers collection
async function fetchSubject() {
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
    // console.log(currentSubject);
    //bind the click event listener with the submit button
    //$getUserContext.addEventListener('click', getUserContext);
    //now set up the game
    setTaskSetting();
    setUpGame();
    showInstruction();
  })
  .catch((e) =>
    console.log(e)
  );

function showInstruction(){
  fadeIn($instructionScreen, 1, makeVideoVisible);
  const instTexts = document.querySelectorAll('.instruction');
  if(instTexts.length > 0){
    fadeIn(instTexts[0], 3);
  }
}

function makeVideoVisible(){
  console.log("make the video visible");
  document.querySelector("#videoContainer").style.visibility = "visible";
}

function setUpInstruction(){

  for(let i=0; i < instructions.length; i++){

    let $instruction = document.createElement("div");
    $instruction.classList.add('instructionWrapper');
    $instructionScreen.appendChild($instruction);

    if(instructions[i].background!=null && instructions[i].isVideo!=1){
      $instruction.innerHTML += `<img src=${pathToSlides+instructions[i].background}>`;
    }
    if(instructions[i].bgColor!=null){
      $instruction.style.backgroundColor = instructions[i].bgColor;
    }

    if(instructions[i].text!=null){
      $instruction.innerHTML += `<div class="instruction">${instructions[i].text.en}</div>`;
    }
    //not the last screen, so put the next button
    if(i < instructions.length-1){
      $instruction.innerHTML += `<div class="nextBtn"></div>`;
    }
    instructionPages.push($instruction);
  }

  const nextBtns = document.querySelectorAll('div.nextBtn');
  const instTexts = document.querySelectorAll('div.instruction');

  for(let i=0; i < instTexts.length; i++){
    if(instructions[i].x != null) {
      instTexts[i].style.left = instructions[i].x;
      instTexts[i].style.top = instructions[i].y;
    }
  }

  for(let i=0; i < nextBtns.length; i++){
    nextBtns[i].addEventListener('click', function(){
      let delay = parseInt(instructions[i+1].textDelay);
      fadeIn(instructionPages[i+1]);
      if(i+1 == instructions.length-1) {
        //if it's the last slide
        //then after fading in the text
        //set the pointerEvents of the instruction page to none
        //fade in the startBtn
        fadeIn(instTexts[i+1], delay+1, ()=>{
          instructionPages[i+1].style.pointerEvents = "none";
          fadeIn($startBtn);
        })

        fadeIn($startBtnContainer, delay+1);

      } else {
        fadeIn(instTexts[i+1], delay+1);
      }

      if(instructions[i+1].isVideo == 1){
        if (video) {
          if (video.paused) {
            video.play();
          }
        }
        fadeOut(instructionPages[i],0.5, true);
      } else {
        fadeOutDelay(instructionPages[i], delay, true);
      }
    })
  }
  //once all set, hide all but the first one
  for(let i=0; i < instructionPages.length; i++){
    instructionPages[i].style.display = "none";
  }
  instructionPages[0].style.display = "block";
}
//when the submit button is clicked do this
function getUserContext() {
    //get all the values from the input elements
    // const userID = document.querySelector('#name').value;
    const clickLimit = document.querySelector('#clickLimit').value;
    const timeLimitOn = document.querySelector('#timeLimitSwitch').checked;
    const timeLimit = timeLimitOn ? document.querySelector('#timeLimit').value : -1;
    // const ageYear = document.querySelector('#ageYear').value;
    // const ageMonth = document.querySelector('#ageMonth').value;
    // const gender = document.querySelector('#genderOptions').options[document.getElementById("genderOptions").selectedIndex].value;

    //get the current date and time
    const timestamp = Date.now();
    //store it in the variable experiment
    sessionData.clickLimit = clickLimit;
    sessionData.timeLimit = timeLimit;
    sessionData.timestamp = timestamp;
    // sessionData.windowSize = {
    //   width: window.innerWidth,
    //   height: window.innerHeight,
    // };

    //make sure the game view is all hidden
    $game.style.display = "none";
    $game.style.opacity = 0;
    //now set up the game
    setUpGame();
    //fade out the welcome screen and fade in the game screen
    fadeOut($welcomeScreen,0.5, true);
    fadeIn($game);
}

function setTaskSetting(){
  //get the current date and time
  //store it in the variable sessionData
  sessionData.clickLimit = clickLimit;
  sessionData.timeLimit = timeLimit;
  //fade out the instruction screen and fade in the game screen
}

function setUpGame() {
  //make sure the game view is all hidden
  $game.style.display = "none";
  $game.style.opacity = 0;

  // console.log("set up the game here");
  $game.innerHTML = `<div onclick="void(0);">
      <div id="gameView" class="gameView">
        <div id="clickArea" class="clickArea"></div>
        <!--video container used to be here-->
        <!-- <div id="game-ui" class="game-ui"> -->
          <!--<p class="instruction"> Click to create rain drops.</p>-->
          <!-- <a class="cta" href="#" id="startBtn"> Start the Game </a> -->
        <!-- </div> -->
        <div class="thanks">
          <h1> Thanks for your participation! </h1>
          <!-- <span class="sun"></span> -->
        </div>
        <div id="buttons">
          <a class="cta disabled" href="#" id="submit"> Finish </a>
          <a class="cta disabled" href="#/game" id="playback"> Play back </a>
        </div>
      </div>
    </div>`;

  // var clickEvent = new MouseEvent("click", {
  //   "view": window,
  //   "bubbles": true,
  //   "cancelable": false
  // });

  let timeID;
  let isGameOn = false;

  //get the reference to the game view HTML elements
  const $gameView = document.querySelector('#gameView');
  const $clickArea = document.querySelector('#clickArea');

  // experiment.clickArea = {width:clickArea, height:clickArea};
  //these two are hidden but left here for added functionality for future
  const $submitButton = document.querySelector('#submit');
  const $playButton = document.querySelector('#playback');
  // const $appHeader = document.querySelector('#app-header');
  const $gameUI = document.querySelector('#game-ui');
  const $thanks = document.querySelector('.thanks');
  // const $sun = document.querySelector('.sun');

  //get the click limit and convert it to a number
  let clickLimit = parseInt(sessionData.clickLimit);
  //now check if the time limit has been set if so, set the time limit;
  const timeLimit = parseInt(sessionData.timeLimit);


  // $appHeader.style.display = "none";

  //hide the thank you screen
  $thanks.style.display = "none";
  $thanks.style.opacity = 0;

  //make sure the game view is 100% of the screen height
  // $gameView.style.height = window.innerHeight + "px";

  //if startbutton is clicked
  $startBtn.addEventListener('click', function(e) {
    e.preventDefault();
    //play the video
    // if (video) {
    //   if (video.paused) {
    //     video.play();
    //   }
    // }
    //fade out the game ui
    // fadeOut($gameUI, true);
    const timestamp = Date.now();
    sessionData.timestamp = timestamp;

    // $gameUI.style.pointerEvents = "none";
    console.log("start the game!");
    fadeOut($instructionScreen, 2, true);
    $instructionScreen.style.pointerEvents = "none";

    fadeIn($game);

    //get the clickable area and store it to the variable
    const clickBound = $clickArea.getBoundingClientRect();
    sessionData.windowSize = {
      width:$game.getBoundingClientRect().width,
      height:$game.getBoundingClientRect().height,
      clickBounds: {
        top: clickBound.top,
        left: clickBound.left,
        right:clickBound.right,
        bottom:clickBound.bottom
      }
    };

    //turn the game on with n seconds delay
    setTimeout(function() {
        isGameOn = true;
        if (!timeID && timeLimit > 0) {
          //only set up the timer if the time limit has been set
          timeID = setTimeout(function() {
            //console.log("timeout");
            // $submitButton.dispatchEvent(clickEvent);
            finishGame();
          }, timeLimit*1000);
        }
    }, 2000);

  })

  // $gameView.addEventListener('touchstart', () => {});
  // $gameView.addEventListener('touchend', () => {});
  // $gameView.addEventListener('touchcancel', () => {});
  // $gameView.addEventListener('touchmove', () => {});
  //gameview clicks
  $gameView.addEventListener('click', function(e) {
    //see if the click limit is left, if not, finish game
    if(clickLimit > 0){
      const clickAreaRect = $clickArea.getBoundingClientRect();
      let inOrOut = isInside(e.offsetX, e.offsetY,clickAreaRect);
      // console.log("is it in or out?" + inOrOut);
      if (isGameOn && inOrOut) {
        // console.log("it's in");
        // if(inOrOut){
        clickLimit--;
        // }
        let currentTime = new Date().getTime();
        //create a new data of the current dot
        const data = {
          position: {
            x: e.offsetX,
            y: e.offsetY,
            rX: inOrOut ? mapRange(e.offsetX, clickAreaRect.left, clickAreaRect.right, 0, 1) : -1,
            rY: inOrOut ? mapRange(e.offsetY, clickAreaRect.top, clickAreaRect.bottom, 0, 1) : -1
            // inside: inOrOut
          },
          time: currentTime
        }
        //add the data of the current dot to the existing dots
        dots = [...dots, data];
        //draw the dot on the screen
        if(inOrOut){
          createDot(data.position, this);
        }

        //this has no function right now because the submit button is hidden
        //but left here just in case we bring back the button
        if (dots.length > 0 && $submitButton.classList.contains('disabled')) {
          $submitButton.classList.remove('disabled');
        }
      }
    }else if(isGameOn){
      //if the click limit has run out, finish the game
      finishGame();
    }
  })

  //these are not functioning since these buttons are hidden
  //but left here just in case we bring back the feature
  $submitButton.addEventListener('click', function(e) {
    e.preventDefault();
    finishGame();
  })

  $playButton.addEventListener('click', function(e) {
    e.preventDefault();
    $submitButton.classList.add('disabled');
    let {
      data
    } = store.getState();
    let arrayData = data[data.length - 1];
    // console.log(arrayData);
    replay(arrayData, $gameView);
    this.classList.add('disabled');
  })

  function finishGame() {
    // console.log("clear timeout")
    //make sure we stop the timer if it's been created
    if(timeID)
      clearTimeout(timeID);
    isGameOn = false;
    //update the subject data
    currentSubject.tasks.two = 1;
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
    sessionData.dots = dots;
    //then store it to the storage which will post it to the database
    store.dispatch({
      type: dots.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
      payload: {
        data: sessionData
      }
    });

    //empty the dots array
    dots = [];
    console.log("data logged");
    //fade in the thank you with half second delay
    fadeIn($thanks,.5);

    setTimeout(function() {
      window.location.href = "/"+"?subject="+currentSubject.subjectNum+"&id="+experiment.id+"&age="+currentSubject.age.year;
    }, 3000);
    // gsap.from('.sun', {y:200, duration:2.5, ease:"elastic.out(1, 0.3)", delay:1})
    // gsap.to('.sun',{filter:"blur(0px)", scale:1.2, repeat:-1, yoyo:true, duration:1});
    // gsap.from($gameUI, {opacity:0, duration:1});
  }
}

//function for drawing the dot on the screen
function createDot(options, $gameView, fadeOut = true, remove = true) {
  const dot = document.createElement('div');
  dot.classList.add('rainDrop');
  dot.style.pointerEvents = "none";
  $gameView.append(dot);
  dot.style.top = options.y + "px";
  dot.style.left = options.x + "px";
  dot.style.opacity = 0.6;
  dot.style.transform = "scale(0.6,0.6)"
  // fadeIn(dot);
  gsap.to(dot, {
    duration: .3,
    ease: "power4.out",
    transform: "scale(1,1)",
    opacity: 1,
    onComplete: fadeOut ? fade : null
  });

  function fade() {
    gsap.to(dot, {
      duration: 1,
      ease: "power4.in",
      opacity: 0,
      onComplete: remove ? removeDot : null
    });
  }

  function removeDot() {
    dot.remove();
  }

}
//some utility functions for fading in and out using Greensock animation library (GSAP)
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

function isInside(x,y,rect){
  if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
    return true;
  }

  return false;
}

function mapRange(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
//dots play back function
//not used right now but left here just in case
async function replay(data, $gameView) {
  $gameView.style.pointerEvents = "none";
  // console.log(data);
  let dTime = 0;
  [...$gameView.children].forEach((dot) => {
    dot.style.display = "none";
    dot.style.opacity = 0;
    dot.remove();
  });

  await timeout(500);

  data.forEach(d => {
    const playback = setTimeout(function() {
      createDot(d.position, $gameView, false, false);
    }, d.time - data[0].time);
    dTime = d.time - data[0].time;
  })

  const done = setTimeout(function() {

    [...$gameView.children].forEach((dot) => {
      dot.style.display = "unset";
      dot.style.opacity = .9;
    });

    document.querySelector('#playback').classList.remove('disabled');
    document.querySelector('#submit').innerHTML = "Reset";
    document.querySelector('#submit').classList.remove('disabled');

  }, dTime + 500);

}

function findSubject(n) {
  for (let i = 0; i < subjects.length; i++) {
    let subjectObj = subjects[i][1][0];
    if (subjectObj.subjectNum == subjectNum && subjectObj.age.year == ageGroup) {
      //found it
      currentSubjectID = subjects[i][0];
      return subjectObj;
    }
  }
}
