//import the data storing script
import store from './utils/storage.js'



//get the current data stored, unpack it as object
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};

const totalCards = 41;
let currentCardNum = 0;

//make array for sequence set
var environment = [1];
//array to store choices
var choices = [-99];
//array to store if the choice is correct guess or not
var correct = [-99];
//array to store card DOM objects
var $cards = [];

const cardWidth = 130;
const cardGap = 30;

//get the reference to the HTML elements we need
const $getUserContext = document.querySelector('#collectUserContext');
const $welcomeScreen = document.querySelector('.container');
const $game = document.querySelector('#content');

document.body.addEventListener('touchstart', () => {
  document.activeElement.blur();
});

let sequence = [];

fetch('/sequence')
  .then((response) => {
    response.json().then((data) => {
      for(let i in data){
        let innerarray = [];
        for(let j in data[i]){
          innerarray.push(data[i][j]);
        }
        sequence.push(innerarray);
      }
      console.log(sequence[0]);
    });
  })
  .catch((err) => {
    console.log("something went wrong");
  });

//bind the click event listener with the submit button
$getUserContext.addEventListener('click', getUserContext);
//when the submit button is clicked do this
function getUserContext() {
  //get all the values from the input elements
  const userID = document.querySelector('#name').value;
  // const clickLimit = document.querySelector('#clickLimit').value;
  // const timeLimitOn = document.querySelector('#timeLimitSwitch').checked;
  // const timeLimit = timeLimitOn ? document.querySelector('#timeLimit').value : -1;
  const ageYear = document.querySelector('#ageYear').value;
  const ageMonth = document.querySelector('#ageMonth').value;
  const sequenceSet = document.querySelector('#sequenceSet').value;
  // const gender = document.querySelector('input[name="gender"]:checked').value;
  const genderOptions = document.getElementById('genderOptions');
  // console.log(genderOptions.options)
  const gender = genderOptions.options[genderOptions.selectedIndex].value;
  //get the image set option
  const imageSetOptions = document.getElementById('imageSetOptions');
  // console.log(genderOptions.options)
  const imageSet = imageSetOptions.options[imageSetOptions.selectedIndex].value;
  //get the current date and time
  const timestamp = Date.now();
  //store it in the variable experiment
  experiment.userID = userID;
  // experiment.clickLimit = clickLimit;
  // experiment.timeLimit = timeLimit;
  experiment.timestamp = timestamp;
  experiment.windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  experiment.age = {
    year: ageYear,
    month: ageMonth
  };
  experiment.gender = gender;
  experiment.imageSet = imageSet;
  experiment.sequenceSet = sequenceSet;
  experiment.pValue = sequence[parseInt(sequenceSet)-1][41];

  // console.log(experiment);
  //make sure the game view is all hidden
  $game.style.display = "none";
  $game.style.opacity = 0;
  //now set up the game
  setUpGame();
  //fade out the welcome screen and fade in the game screen
  fadeOut($welcomeScreen, true);
  fadeIn($game);
}

function setUpGame() {
  //draw gameboard - series of rectangles
  //draw the character on the first spot.
  //make two buttons in the center
  //when either one is clicked - fade it out.
  //move the character to the next spot
  //repeat until we are out of spot
  //game ends

  // console.log("set up the game here");
  $game.innerHTML = `<div onclick="void(0);">
      <div id="gameView" class="gameView">
        <div id="game-container">
        <!-- gameboard gets drawn here -->
          <div class="bunny" id="bunny"></div>
        </div>
        <div id="game-HUD" class="game-HUD">
            <!-- carrot or no carrot button goes here -->
            <div class="choice-card" id="left" data-choice="0"></div>
            <div class="choice-card" id="right" data-choice="1"></div>
        </div>
        <div id="feedback" class="feedback">Hello</div>
        <!-- <div id="clickArea" class="clickArea"></div>
        <!--video container used to be here-->
        <div id="game-ui" class="game-ui">
          <p class="instruction"> Will there be a carrot or not? You have to guess!</p>
          <a class="cta start" href="#" id="startBtn"> Start the game</a>
        </div>
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

  let timeID;
  let isGameOn = false;

  //get the reference to the game view HTML elements
  const $startBtn = document.querySelector('#startBtn');
  const $gameView = document.querySelector('#gameView');
  //hide the thank you screen

  const $gameContainer = document.querySelector('#game-container');
  const $gameHUD = document.querySelector('#game-HUD');

  let $choiceCards = document.querySelectorAll('.choice-card');
  const $leftChoice = document.querySelector('#left');
  const $rightChoice = document.querySelector('#right');
  const $bunny = document.querySelector("#bunny");


  const $feedback = document.querySelector('#feedback');

  // const $clickArea = document.querySelector('#clickArea');

  //these two are hidden but left here for added functionality for future
  const $submitButton = document.querySelector('#submit');
  const $playButton = document.querySelector('#playback');
  // const $appHeader = document.querySelector('#app-header');
  const $gameUI = document.querySelector('#game-ui');
  const $thanks = document.querySelector('.thanks');
  //hide the thank you screen
  $thanks.style.display = "none";
  $thanks.style.opacity = 0;

  setUpGameBoard();
  setFirstBunny();
  // showOptions();
  fadeIn($bunny, 0.5);
  revealFirstCard();

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
    fadeOut($gameUI, true);
    $gameUI.style.pointerEvents = "none";

    //move the bunny to the next position
    moveNext();

    //get the clickable area and store it to the variable
    // const clickBound = $clickArea.getBoundingClientRect();
    // experiment.clickArea = {width:clickArea.width, height:clickArea.height};
    experiment.windowSize = {
      width: $game.getBoundingClientRect().width,
      height: $game.getBoundingClientRect().height
    };
  })

  // setUpGameBoard();
  // setUpBunny();
  // showOptions();
  // $gameView.addEventListener('touchstart', () => {});
  // $gameView.addEventListener('touchend', () => {});
  // $gameView.addEventListener('touchcancel', () => {});
  // $gameView.addEventListener('touchmove', () => {});
  //gameview clicks

  //set up gameboard
  function setUpGameBoard() {
    let col = 0;
    let row = 0;
    let x, y;

    //load the sequence to the environment variable
    for (let i = 0; i < totalCards-1; i++) {
      //get the sequence from the sequence set
      let env = sequence[parseInt(experiment.sequenceSet)-1][i]
      environment.push(env);
    }

    //lay out the card
    for (let i = 0; i < totalCards; i++) {
      //get the sequence from the sequence set
      let env = environment[i];

      if (x > 1000) {
        col = 1;
        row++;
      }

      x = (cardWidth) * col + 20;
      y = row * (cardWidth) + 10;
      col++;
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
    let bunnyPosition = $current.getBoundingClientRect();
    // console.log($current);
    let x = bunnyPosition.x + bunnyPosition.width / 2;
    let y = bunnyPosition.y + bunnyPosition.height / 2;
    let duration = 1;
    moveBunny({
      x,
      y,
      duration
    });
  }

  function setFirstBunny() {
    drawBunny({
      x: 85,
      y: 75
    });
  }

  function revealFirstCard() {
    $cards[0].setAttribute('data-env', environment[0]);
  }

  function showOptions() {
    //show the cards
    // $gameHUD.style.opacity = 1;
    let r = Math.random();

    $leftChoice.setAttribute('data-choice', r > 0.5 ? 1 : 0);
    $rightChoice.setAttribute('data-choice', r > 0.5 ? 0 : 1);

    //fade in the game hud - where the option buttons are drawn with 2 second delay
    fadeIn($gameHUD, 2, "flex");
  }

  function drawBGCard(options, fadeOut = true, remove = true) {
    const card = document.createElement('div');
    card.classList.add('bgCard');
    if (options.id == currentCardNum) {
      card.classList.add('currentCard');
    } else {
      card.classList.remove('currentCard');
    }

    card.innerHTML = options.env;
    card.style.pointerEvents = "none";
    $gameContainer.append(card);
    card.style.top = options.y + "px";
    card.style.left = options.x + "px";
    card.style.opacity = 0.6;
    card.style.transform = "scale(0.6,0.6)"
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

  function moveBunny(options){
    gsap.to(".bunny", {
      x: options.x,
      y: options.y,
      duration: options.duration
    });
  }


  //event listeners
  $choiceCards.forEach(function(userItem) {
    userItem.addEventListener('click', function(e) {
      e.preventDefault();
      // console.log("current card number: " + currentCardNum);
      if (currentCardNum <= totalCards - 1) {
        let choice = e.target.dataset.choice;
        // console.log("choice: " + choice);
        choices = [...choices, parseInt(choice)];
        //choices.push[choice];
        moveNext();
        $gameHUD.style.pointerEvents = "none";
        fadeOut($gameHUD, false);
        showFeedback();
      } else {
        //finish the game;
      }
    })
  });

  function showFeedback() {
    fadeIn($feedback);
    fadeOut($feedback, false, 0.5)
  }

  function moveNext() {
    //move the bunny to the next position
    //change the current $card
    if (currentCardNum == totalCards - 1) {
      finishGame();
    } else {

      currentCardNum++;
      $cards[currentCardNum - 1].classList.remove('currentCard');
      $cards[currentCardNum].classList.add('currentCard');
      // setUpBunny();
      moveUpBunny();
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
      $cards[currentCardNum - 1].setAttribute('data-env', env);

      //show the buttons
      showOptions();
    }

  }

  // function finishGame() {
  //   currentCardNum++;
  //   const index = $cards[currentCardNum - 1].dataset.index;
  //   //get the environment
  //   const env = environment[parseInt(index)];
  //   const ch = choices[choices.length - 1];
  //   console.log("env: " + env + ", choice: " + ch);
  //   if (env == ch) {
  //     $feedback.innerHTML = "Correct!";
  //     correct = [...correct, 1];
  //   } else {
  //     correct = [...correct, 0];
  //     $feedback.innerHTML = "Oops, there was ";
  //     if (env == 0) {
  //       $feedback.innerHTML += "no carrot!";
  //     } else {
  //       $feedback.innerHTML += "a carrot!";
  //     }
  //   }
  //   $cards[currentCardNum - 1].setAttribute('data-env', env);
  //   $cards[currentCardNum - 1].classList.remove('currentCard');
  //   console.log("game finished");
  //   //package the data
  //   data = {
  //     "environment": environment,
  //     "choices": choices,
  //     "correct": correct
  //   }
  //   //log the data
  //   console.log(data);
  // }

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
    //make sure we stop the timer if it's been created
    if (timeID)
      clearTimeout(timeID);
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
    $cards[currentCardNum - 1].setAttribute('data-env', env);
    $cards[currentCardNum - 1].classList.remove('currentCard');
    console.log("game finished");
    //package the data
    sessionData = {
      "environment": environment,
      "choices": choices,
      "correct": correct
    }
    //log the data
    // console.log(sessionData.length);
    //put the dots to the experiment object
    experiment.sequences = sessionData;
    //then store it to the storage which will post it to the database
    store.dispatch({
      type: choices.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
      payload: {
        data: experiment
      }
    });

    //empty-reset the choices array
    choices = [-99];
    correct = [-99];

    console.log("data logged");
    //fade in the thank you with half second delay
    fadeIn($thanks, .5);
    // setTimeout(function() {
    //   window.location.reload(1);
    // }, 3000);
    // gsap.from('.sun', {y:200, duration:2.5, ease:"elastic.out(1, 0.3)", delay:1})
    // gsap.to('.sun',{filter:"blur(0px)", scale:1.2, repeat:-1, yoyo:true, duration:1});
    // gsap.from($gameUI, {opacity:0, duration:1});
  }
}

//function for drawing the dot on the screen
// function createDot(options, $gameView, fadeOut = true, remove = true) {
//   const dot = document.createElement('div');
//   dot.classList.add('rainDrop');
//   dot.style.pointerEvents = "none";
//   $gameView.append(dot);
//   dot.style.top = options.y + "px";
//   dot.style.left = options.x + "px";
//   dot.style.opacity = 0.6;
//   dot.style.transform = "scale(0.6,0.6)"
//   // fadeIn(dot);
//   gsap.to(dot, {
//     duration: .3,
//     ease: "power4.out",
//     transform: "scale(1,1)",
//     opacity: 1,
//     onComplete: fadeOut ? fade : null
//   });
//
//   function fade() {
//     gsap.to(dot, {
//       duration: 1,
//       ease: "power4.in",
//       opacity: 0,
//       onComplete: remove ? removeDot : null
//     });
//   }
//
//   function removeDot() {
//     dot.remove();
//   }
//
//   // if(fadeOut){
//   //   fade(dot, remove);
//   // }
// }

////////////
//some utility functions for fading in and out using Greensock animation library (GSAP)
function fadeIn(elem, delay, display = "block") {
  elem.style.display = display;
  elem.style.opacity = 0;
  gsap.to(elem, {
    duration: 1,
    ease: "power1.inOut",
    opacity: 1,
    delay: delay,
    onComplete: enable,
    onCompleteParams: [elem]
  });
}

function fadeOut(elem, hide, delay = 0) {
  gsap.to(elem, {
    duration: .5,
    ease: "power1.inOut",
    opacity: 0,
    onComplete: hide ? hideElem : null,
    onCompleteParams: [elem],
    delay: delay
  });
}

function hideElem(elem) {
  elem.style.display = "none";
}

function enable(elem) {
  elem.style.pointerEvents = "auto";
}

// function isInside(x, y, rect) {
//   if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
//     return true;
//   }
//
//   return false;
// }

function mapRange(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
// //dots play back function
// //not used right now but left here just in case
// async function replay(data, $gameView) {
//   $gameView.style.pointerEvents = "none";
//   // console.log(data);
//   let dTime = 0;
//   [...$gameView.children].forEach((dot) => {
//     dot.style.display = "none";
//     dot.style.opacity = 0;
//     dot.remove();
//   });
//
//   await timeout(500);
//
//   data.forEach(d => {
//     const playback = setTimeout(function() {
//       createDot(d.position, $gameView, false, false);
//     }, d.time - data[0].time);
//     dTime = d.time - data[0].time;
//   })
//
//   const done = setTimeout(function() {
//
//     [...$gameView.children].forEach((dot) => {
//       dot.style.display = "unset";
//       dot.style.opacity = .9;
//     });
//
//     document.querySelector('#playback').classList.remove('disabled');
//     document.querySelector('#submit').innerHTML = "Reset";
//     document.querySelector('#submit').classList.remove('disabled');
//
//   }, dTime + 500);
//
// }
