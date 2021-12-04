//import the data storing script
import store from '/utils/subject_storage.js'

//german
const germanMsgs = {
  welcomeMsg : "Willkommen beim Experiment",
  enterAgeSubjectMsg: "Bitte geben Sie das Alter und die Fächernummer ein.",
  ageLabel: "Alter",
  yearLabel: "Jahre",
  monthLabel: "Monate",
  enterSubjectNumMsg: "Betreffnummer",
  checkSubjectID: "Überprüfen Sie die Betreffnummer",
  subjectInfoLabel: "Dies ist ein neues Thema. Bitte wählen Sie das Geschlecht aus.",
  genderLabel: "Geschlecht",
  tryAgain: "Dieses Thema hat alle Aufgaben abgeschlossen. Überprüfen Sie die Nummer und versuchen Sie es erneut."
}

const englishMsgs = {
  welcomeMsg : "Welcome to the experiment",
  enterAgeSubjectMsg: "Please enter the age and subject number.",
  ageLabel: "Age",
  yearLabel: "Year",
  monthLabel: "Month",
  enterSubjectNumMsg: "Subject Number",
  checkSubjectID: "Check Subject Number",
  subjectInfoLabel: "This is a new subject. Please select the gender.",
  genderLabel: "Gender",
  tryAgain: "This subject has finished all tasks. Check the number and try again."
}

//get the current data stored, unpack it as object
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};
let newSubject = false;
let lang = "en";

const urlParams = new URLSearchParams(window.location.search);
const subjectNumParam = urlParams.get('subject');
const ageGroupParam = urlParams.get('age');
const id = urlParams.get('id');
let subjects = [];

//get the reference to the HTML elements we need
const $interface = document.querySelector("#interfaceContainer");
const $generateNewID = document.querySelector('#generateNewIDButton');
const $inputAgeSubjectNum = document.querySelector('#inputAgeSubjectNum');
const $inputGender = document.querySelector('#inputGender');
// const $submitLanguage = document.querySelector('#submitLanguage');
const $checkSubjectID = document.querySelector('#checkSubjectID');

const $rabbitTaskButton = document.querySelector('#rabbitTaskButton');
const $treeTaskButton = document.querySelector('#treeTaskButton');
const $rainTaskButton = document.querySelector('#rainTaskButton');

$rabbitTaskButton.addEventListener('click', startTheTask);
$treeTaskButton.addEventListener('click', startTheTask);
$rainTaskButton.addEventListener('click', startTheTask);

document.body.addEventListener('touchstart', () => {
  document.activeElement.blur();
});

//check time zone;
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(timezone);
let startIndex;
if(timezone == "America/New_York"){
  //if it's new york
  startIndex = 0;
} else {
  //in germany
  startIndex = 51;
}
//generate the subject num options
for(let i = startIndex; i < startIndex+50; i++){
  document.querySelector('#subjectNumOptions').innerHTML += `<option value="${i}">${i}</option>`
}
//bind the click event listeners to the buttons
// $submitLanguage.addEventListener('click', submitLanguageOption);
// function submitLanguageOption(){
//   let ele = document.getElementsByName('radio');
//   for(let i = 0; i < ele.length; i++) {
//       if(ele[i].checked)
//       lang = ele[i].value;
//   }
//   //now hide the button
//   fadeOut($submitLanguage, false);
//   //show the next section
//   fadeIn($inputAgeSubjectNum);
// }

var radios = document.querySelectorAll('input[type=radio][name="radio"]');

function changeHandler(event) {
   if ( this.value === 'en' ) {
     console.log("english");
     lang = "en";
     changeLanguage(englishMsgs);
   } else if ( this.value === 'de' ) {
      console.log("Deutsch");
      lang = "de";
      changeLanguage(germanMsgs);
   }

}

function changeLanguage(msgs){
  for(const key in msgs){
    let selector = '#'+ key;
    // console.log(selector, msgs[key]);
    document.querySelector(selector).innerHTML = msgs[key];
    // console.log(document.querySelector(selector));
  }
}

Array.prototype.forEach.call(radios, function(radio) {
   radio.addEventListener('change', changeHandler);
});

$generateNewID.addEventListener('click', generateNewID);
function generateNewID() {
  // //create a new subject id;
  // let newID = subjects.length + 1;
  // //put it in the form
  // document.querySelector('#name').value = newID;
  // resetAllInput();
  // if (!$checkSubjectID.classList.contains('disabled')) {
  //   $checkSubjectID.classList.add('disabled');
  // }
  // document.querySelector('#subjectInfoLabel').innerHTML = "This is a new subject. Please enter the info below."
  // $subjectInfoInput.style.display = "block";
  // newSubject = true;
}

function resetAllInput() {
  document.querySelector('#rabbitTaskButton').classList.remove("disabled");
  document.querySelector('#rabbitTaskCheckbox').classList.remove('checked');
  document.querySelector('#treeTaskButton').classList.remove("disabled");
  document.querySelector('#treeTaskCheckbox').classList.remove('checked');
  document.querySelector('#rainTaskButton').classList.remove("disabled");
  document.querySelector('#rainTaskCheckbox').classList.remove('checked');
  document.querySelector('#tryAgain').style.display = "none";
}

// document.querySelector('#name').addEventListener('change', function() {
//   //if there's something in the subjectID then enable the check button
//   if (this.value > 0 && $checkSubjectID.classList.contains('disabled')) {
//     $checkSubjectID.classList.remove('disabled');
//   }
// })

document.querySelector('#subjectNumOptions').addEventListener('change', function() {
  //if there's something in the subjectID then enable the check button
  if (this.options[subjectNumOptions.selectedIndex].value != null && $checkSubjectID.classList.contains('disabled')) {
    $checkSubjectID.classList.remove('disabled');
  }
})

//when the checkID button is pressed
//it checks the id in the database and populate all the inputs
$checkSubjectID.addEventListener('click', checkSubjectID);
//
// fetch the subjectNumbers collection
fetch('/subjects')
  .then((response) => {
    response.json().then((data) => {
      for (let i in data) {
        let innerarray = [];
        for (let j in data[i]) {
          innerarray.push(data[i][j]);
        }
        subjects.push(innerarray);
      }
      // console.log(subjects[0]);
      //do something
      //first check if this is a redirect or not, if it's a redirect then checkSubjectID
      if(subjectNumParam!=null && ageGroupParam!=null){
        // console.log("there's url parameters: "+subjectNum +","+id);
        //document.querySelector('#name').value = subjectNumParam;
        const subjectNumOptions = document.getElementById('subjectNumOptions');
        subjectNumOptions.value = subjectNumParam;
        checkSubjectID();
        fadeInInterface($interface);
      } else {
        //if not, this is a new experiment
        fadeInInterface($interface);
        console.log("fade in the interface");
      }



    });
  })
  .catch((err) => {
    console.log("something went wrong");
  });


function checkSubjectID() {
  resetAllInput();
  // const subjectNum = document.querySelector('#name').value;
  const subjectNum = document.getElementById('subjectNumOptions').value;
  const ageYearOptions = document.getElementById('ageYearOptions');
  const ageGroup = ageYearOptions.options[ageYearOptions.selectedIndex].value;

  let match = false;
  for (let i = 0; i < subjects.length; i++) {
    let subjectObj = subjects[i][1][0];
    // console.log(subjectObj);
    if (subjectObj.subjectNum == subjectNum && subjectObj.age.year == ageGroup) {
      //subject has been found
      newSubject = false;
      document.querySelector('#subjectInfoLabel').innerHTML = "This is an existing subject. Please make sure the info below is correct."

      // const ageYearOptions = document.getElementById('ageYearOptions');
      // ageYearOptions.options[ageYearOptions.selectedIndex].value = subjectObj.age.year;
      // const ageMonthOptions = document.getElementById('ageMonthOptions');
      // ageMonthOptions.options[ageMonthOptions.selectedIndex].value = subjectObj.age.month;

      const genderOptions = document.getElementById('genderOptions');
      genderOptions.options[genderOptions.selectedIndex].value = subjectObj.gender;
      let task = 0;
      if (subjectObj.tasks.one == 1) {
        document.querySelector('#rabbitTaskButton').classList.add("disabled");
        document.querySelector('#rabbitTaskCheckbox').classList.add('checked');
        task++;
      }
      if (subjectObj.tasks.two == 1) {
        document.querySelector('#treeTaskButton').classList.add("disabled");
        document.querySelector('#treeTaskCheckbox').classList.add('checked');
        task++;
      }
      if (subjectObj.tasks.three == 1) {
        document.querySelector('#rainTaskButton').classList.add("disabled");
        document.querySelector('#rainTaskCheckbox').classList.add('checked');
        task++;
      }
      if (task == 3) {
        document.querySelector('#tryAgain').style.display = "block";
      }
      // if (subjectObj.lang == "de") {
      //   document.querySelector('#languageToggleSwitch').checked = true;
      // }
      match = true;
      // $inputGender.style.display = "block";
      fadeIn($inputGender);
      // fadeOut($checkSubjectID, true);
      break;
    }
  }

  if (!match) {
    //if nothing has been matched then it means it's new.
    console.log("nothing matching")
    // generateNewID();
    newSubject = true;
    // document.querySelector('#subjectInfoLabel').innerHTML = "The subject number did not match our record. So we generated a new one for you. Please enter the info below.";
    document.querySelector('#subjectInfoLabel').innerHTML = "This is a new subject. Please select their gender."
    fadeIn($inputGender);
  }
}

//bind the click event listener with the submit button
// $getUserContext.addEventListener('click', getUserContext);
//when the submit button is clicked do this
function updateSubject() {
  //get all the values from the input elements
  // const subjectNum = document.querySelector('#name').value;
  const subjectNum = document.querySelector('#subjectNumOptions').value;
  //
  const ageYearOptions = document.getElementById('ageYearOptions');
  const ageYear = ageYearOptions.options[ageYearOptions.selectedIndex].value;
  const ageMonthOptions = document.getElementById('ageMonthOptions');
  const ageMonth = ageMonthOptions.options[ageMonthOptions.selectedIndex].value;
  //
  const genderOptions = document.getElementById('genderOptions');
  // console.log(genderOptions.options)
  const gender = genderOptions.options[genderOptions.selectedIndex].value;
  //
  // const germanOn = document.querySelector('#languageToggleSwitch').checked;
  const language = lang;
  //get the current date and time
  const timestamp = Date.now();

  //store it in the variable experiment
  experiment.subjectNum = subjectNum;
  experiment.lang = language;
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
  experiment.tasks = {
    one: 0,
    two: 0,
    three: 0
  }
  experiment.gender = gender;
}

function addNewSubject(){
  //then store it to the storage which will post it to the database
  store.dispatch({
    type: !isEmpty(experiment) ? "ADD_DATA" : "REMOVE_DATA",
    payload: {
      data: experiment
    }
  });
}

function startTheTask(e) {
  //add the new subject to the database if this subject is new
  updateSubject();
  if(newSubject)
    addNewSubject();

  // location.
  if (e.target.name == "one") {
    fadeOutInterface($interface, "task1");
    // location.href = "task1"+"?subject="+experiment.subjectNum;
  } else if (e.target.name == "two") {
    fadeOutInterface($interface, "task2");
    // location.href = "task2"+"?subject="+experiment.subjectNum;
  } else if (e.target.name == "three") {
    fadeOutInterface($interface, "task3");
    // location.href = "task3"+"?subject="+experiment.subjectNum;
  }
}

function isEmpty(obj) {
  for (var x in obj) {
    return false;
  }
  return true;
}

function findSubject(n) {
  for(let i=0; i < subjects.length; i++){
    let subjectObj = subjects[i][1][0];
    if(subjectObj.subjectNum == subjectNum){
      //found it
      currentSubjectID = subjects[i][0];
      return subjectObj;
    }
  }
}

////////////
//some utility functions for fading in and out using Greensock animation library (GSAP)
function fadeIn(elem, duration=1, delay=0, display = "block") {
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

function fadeInInterface(elem) {
  elem.style.visibility = "visible";
  elem.style.opacity = 0;
  gsap.to(elem, {
    duration: 1,
    ease: "power1.inOut",
    opacity: 1,
    delay: 0.5,
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

function fadeOutInterface(elem, onCompleteParam, delay = 0){
  gsap.to(elem, {
    duration: 1,
    delay: delay,
    ease: "power1.inOut",
    opacity: 0,
    onComplete: redirect,
    onCompleteParams: [onCompleteParam]
  });
}

function redirect(param) {
  location.href = param+"?subject="+experiment.subjectNum+"&age="+experiment.age.year;
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
