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
      for (let i in data) {
        let innerarray = [];
        for (let j in data[i]) {
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
  experiment.pValue = sequence[parseInt(sequenceSet) - 1][41];

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
          <!-- <div class="animContainer" id="animContainer">
            <img class="character2" id="character" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/183204/char.png">
          </div> -->
          <canvas class="animContainer" id="canvas-carrot"></canvas>
          <canvas class="animContainer" id="canvas-dirt"></canvas>
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
  const $gameUI = document.querySelector('#game-ui');
  const $thanks = document.querySelector('.thanks');
  //hide the thank you screen
  $thanks.style.display = "none";
  $thanks.style.opacity = 0;

  let bunnyX = 160;
  let bunnyY = 331;

  setUpGameBoard();
  setFirstBunny();
  // showOptions();
  fadeIn($bunny, 0.5);
  // revealFirstCard();

  //make sure the game view is 100% of the screen height
  // $gameView.style.height = window.innerHeight + "px";

  //if startbutton is clicked
  $startBtn.addEventListener('click', function(e) {
    e.preventDefault();
    //fade out the game ui
    fadeOut($gameUI, true);
    $gameUI.style.pointerEvents = "none";

    //move the bunny to the next position
    moveUpBunny();

    // moveNext();

    //get the clickable area and store it to the variable
    // const clickBound = $clickArea.getBoundingClientRect();
    // experiment.clickArea = {width:clickArea.width, height:clickArea.height};
    experiment.windowSize = {
      width: $game.getBoundingClientRect().width,
      height: $game.getBoundingClientRect().height
    };
  })


  //set up gameboard
  function setUpGameBoard() {
    let col = 0;
    let row = 0;
    let x, y;

    //load the sequence to the environment variable
    for (let i = 0; i < totalCards - 1; i++) {
      //get the sequence from the sequence set
      let env = sequence[parseInt(experiment.sequenceSet) - 1][i]
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
    let r = Math.random();
    let left = r > 0.5 ? 1 : 0;
    let right = r > 0.5 ? 0 : 1;
    $leftChoice.setAttribute('data-choice', left);
    $rightChoice.setAttribute('data-choice', right);
    $leftChoice.classList.remove('activeChoiceCard');
    $rightChoice.classList.remove('activeChoiceCard');

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
    userItem.addEventListener('click', function(e) {
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
    fadeIn($gameHUD, 0, "flex");
    //put the bunny into the neutral position
    $bunny.classList.remove("bunny-skipRight");
    $bunny.classList.remove("bunny-skipLeft");
    //draw some border around the card
    // $cards[currentCardNum - 1].classList.remove('currentCard');
    // $cards[currentCardNum].classList.add('currentCard');
  }

  function fadeOutButtons(elem){
    //fadeOut($gameHUD, false);
    if(currentCardNum < totalCards - 1)
    {
      fadeOutShowOptions(elem);
    }
  }

  function fadeOutShowOptions() {
    gsap.to($gameHUD, {
      duration: 1,
      delay: 0,
      ease: "power1.inOut",
      opacity: 0,
      onComplete: generateNextOptions
    });
  }

  function showFeedback() {
    fadeIn($feedback);
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
  sprite_c.src = "animations/cards/yellowCarrot_test.png";

  let sprite_d = new Image();
  sprite_d.onload = initDirt;
  sprite_d.src = "animations/cards/yellowDirt.png";

  // window.addEventListener("resize", resizeCarrot);

  function initCarrot() {
    tl_c = gsap.timeline({ onUpdate: updateCarrot, onComplete: carrotFinished, paused:true })
      .to(carrot, { frame: carrot_frames.length - 1, roundProps: "frame", repeat: 0, ease: "none", duration: 2, delay:0.5 }, 0);
    // tl_c.pause();
  }

  function initDirt() {
    tl_d = gsap.timeline({ onUpdate: updateDirt, onComplete: dirtFinished, paused:true })
        .to(dirt, { frame: dirt_frames.length - 1, roundProps: "frame", repeat: 0, ease: "none", duration: 2, delay:0.5 }, 0);
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
    // const index = $cards[currentCardNum-1].dataset.index;
    // //get the environment
    // const env = environment[parseInt(index)];
    $canvas_carrot.style.visibility = "hidden";
    if(currentCardNum == 0) {
      $cards[0].style.visibility = "visible";
    } else {
      // $cards[currentCardNum - 1].setAttribute('data-env', env);
      $cards[currentCardNum - 1].style.visibility = "visible";
    }

  }

  function dirtFinished(){
    console.log("dirt finished");
    // const index = $cards[currentCardNum-1].dataset.index;
    // //get the environment
    // const env = environment[parseInt(index)];
    $canvas_dirt.style.visibility = "hidden";
    if(currentCardNum == 0) {
      $cards[0].style.visibility = "visible";
    } else {
      // $cards[currentCardNum - 1].setAttribute('data-env', env);
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
    //hide the current card
    $cards[currentCardNum - 1].style.visibility = "hidden";
    //flip animation goes here
    //set up the animation
    if(currentCardNum > 1 ) {
      // var revealAnim = gsap.fromTo($animation,1,{autoAlpha:1,x:0},
      //   {
      //     autoAlpha: 1,
      //     repeat:1,
      //     x:-2250,
      //     ease:SteppedEase.config(15),
      //     onComplete:hideAnimation,
      //     onCompleteParams:[$animation, $cards[currentCardNum - 1]]
      //   }
      // );
      // // //pause the animation
      // revealAnim.pause();
      // revealAnim.restart();
      playAnimation(env);
    }
    // $cards[currentCardNum - 1].classList.remove('currentCard');
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
    
    setTimeout(function() {
      window.location.reload(1);
    }, 3000);
    // gsap.from('.sun', {y:200, duration:2.5, ease:"elastic.out(1, 0.3)", delay:1})
    // gsap.to('.sun',{filter:"blur(0px)", scale:1.2, repeat:-1, yoyo:true, duration:1});
    // gsap.from($gameUI, {opacity:0, duration:1});
  }

  ////////////
  //some utility functions for fading in and out using Greensock animation library (GSAP)




}

function fadeIn(elem, delay, display = "block") {
  elem.style.display = display;
  //elem.style.opacity = 0;
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
