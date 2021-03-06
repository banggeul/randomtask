import storeSubject from '/utils/subject_storage.js'
//import the data storing script
import {
  postData,
  getData,
  putData
} from '/utils/data.js'
// import store from '/utils/subject_storage.js'

//german
const germanMsgs = {
  welcomeMsg: "Willkommen beim Experiment",
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
  welcomeMsg: "Welcome to the experiment",
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
// const {
//   data
// } = store.getState();
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
let ageSortedSubjects = [];
let sortedSubjectIds = [];
let newId;
let age;
let subject;

document.body.addEventListener('touchstart', () => {
  document.activeElement.blur();
});

for (let i = 0; i < 10; i++) {
  ageSortedSubjects.push([]);
  sortedSubjectIds.push([]);
}

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
if (timezone == "America/New_York") {
  //if it's new york
  startIndex = 1;
} else {
  //in germany
  startIndex = 51;
}
//generate the subject num options
for (let i = startIndex; i < startIndex + 50; i++) {
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
  if (this.value === 'en') {
    console.log("english");
    lang = "en";
    changeLanguage(englishMsgs);
  } else if (this.value === 'de') {
    console.log("Deutsch");
    lang = "de";
    changeLanguage(germanMsgs);
  }

}

function changeLanguage(msgs) {
  for (const key in msgs) {
    let selector = '#' + key;
    // console.log(selector, msgs[key]);
    const $msg = document.querySelector(selector);
    if($msg != null){
      $msg.innerHTML = msgs[key];
    }
    // console.log(document.querySelector(selector));
  }

  if (!newSubject) {
    let msg;
    if (lang == "en") {
      msg = "This is an existing subject. Please make sure the info below is correct.";
    } else {
      msg = "Dies ist ein bestehendes Thema. Bitte stellen Sie sicher, dass die folgenden Informationen korrekt sind."
    }
    document.querySelector("#subjectInfoLabel").innerHTML = msg;
  }
}

Array.prototype.forEach.call(radios, function(radio) {
  radio.addEventListener('change', changeHandler);
});

$generateNewID.addEventListener('click', generateNewID);

function generateNewID() {
  //empty all the array
  subjects = [];
  ageSortedSubjects = [];
  sortedSubjectIds = [];

  for (let i = 0; i < 10; i++) {
    ageSortedSubjects.push([]);
    sortedSubjectIds.push([]);
  }

  //fetch the data again
  fetch('/subjects')
    .then((response) => {
      response.json().then((data) => {
        for (let i in data) {
          let innerarray = [];
          for (let j in data[i]) {
            innerarray.push(data[i][j]);
          }
          // console.log(innerarray);
          // subjects.push(innerarray[1]);
          let thisSubject = innerarray[1];
          const thisSubjectId = innerarray[0];
          // console.log(thisSubjectId);
          if (thisSubject.uniqueId == null) {
            thisSubject.uniqueId = thisSubjectId;
          }
          const ageGroupIndex = parseInt(thisSubject.age.year) - 1;
          ageSortedSubjects[ageGroupIndex].push(thisSubject);
          // sortedSubjectIds[ageGroupIndex].push(thisSubjectId);
        }
        //done sorting
        //now generate the new id
        //get the age
        const ageGroup = parseInt(document.getElementById('ageYearOptions').value);
        const ageGroupArray = ageSortedSubjects[ageGroup-1];
        let newId = ageGroupArray.length + startIndex;

        document.querySelector('#subjectNumOptions').value = newId;
        resetAllInput();

        if (!$checkSubjectID.classList.contains('disabled')) {
          $checkSubjectID.classList.add('disabled');
        }
        document.querySelector('#subjectInfoLabel').innerHTML = "We generated a new subject number. Please select their gender."
        fadeIn($inputGender);
        newSubject = true;
      })
    }).catch((err) => {console.log(err)});
  //create a new subject id;

}

function resetAllInput() {
  document.querySelector('#rabbitTaskButton').classList.remove("disabled");
  document.querySelector('#rabbitTaskCheckbox').classList.remove('checked');
  document.querySelector('#treeTaskButton').classList.remove("disabled");
  document.querySelector('#treeTaskCheckbox').classList.remove('checked');
  document.querySelector('#rainTaskButton').classList.remove("disabled");
  document.querySelector('#rainTaskCheckbox').classList.remove('checked');
  document.querySelector('#tryAgain').style.display = "none";
  document.querySelector('#genderOptions').selectedIndex = 0;
  // document.querySelector('#notesInput').value = "";
}

// document.querySelector('#name').addEventListener('change', function() {
//   //if there's something in the subjectID then enable the check button
//   if (this.value > 0 && $checkSubjectID.classList.contains('disabled')) {
//     $checkSubjectID.classList.remove('disabled');
//   }
// })

document.querySelector("#ageYearOptions").addEventListener('change', function() {
  if(this.value > 0){
    $generateNewID.classList.remove('disabled');
    document.querySelector('#subjectNumOptions').disabled = false;
  }
})

document.querySelector("#genderOptions").addEventListener('change', function() {
  if(this.value != "null"){
    // $generateNewID.classList.remove('disabled');
    // document.querySelector('#subjectNumOptions').disabled = false;
    if(document.querySelector("#errorMsg")!=null){
      // document.querySelector('#errorMsg').style.display = "none";
      this.classList.remove('error');
      let error = document.querySelector('#errorMsg');
      error.remove();
    }
  }
})

document.querySelector('#subjectNumOptions').addEventListener('change', function() {
  //if there's something in the subjectID then enable the check button
  if (this.options[subjectNumOptions.selectedIndex].value != null) {
    if ($checkSubjectID.classList.contains('disabled')) {
      $checkSubjectID.classList.remove('disabled');
    }
  } else {
    if (!$checkSubjectID.classList.contains('disabled')) {
      $checkSubjectID.classList.add('disabled');
    }
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
        // console.log(innerarray);
        // subjects.push(innerarray[1]);
        let thisSubject = innerarray[1];
        const thisSubjectId = innerarray[0];
        // console.log(thisSubjectId);
        if (thisSubject.uniqueId == null) {
          thisSubject.uniqueId = thisSubjectId;
        }
        const ageGroupIndex = parseInt(thisSubject.age.year) - 1;
        ageSortedSubjects[ageGroupIndex].push(thisSubject);
        // sortedSubjectIds[ageGroupIndex].push(thisSubjectId);
      }
      // console.log(ageSortedSubjects);
      // console.log(subjects[0]);
      //do something
      //first check if this is a redirect or not, if it's a redirect then checkSubjectID
      if (subjectNumParam != null && ageGroupParam != null) {
        //if this is a redirect, then it must have the subject number param and age
        //check and update the form.
        const subjectNumOptions = document.getElementById('subjectNumOptions');
        subjectNumOptions.value = subjectNumParam;
        document.getElementById('ageYearOptions').value = ageGroupParam;
        checkSubjectID();
        fadeInInterface($interface);
      } else {
        //if not, this is a new experiment
        fadeInInterface($interface);
        // console.log("fade in the interface");
      }
    });
  })
  .catch((err) => {
    console.log("something went wrong");
  });

//no longer used//
function findSubject(n) {
  for (let i = 0; i < subjects.length; i++) {
    let subjectObj = subjects[i][1][0];
    if (subjectObj.subjectNum == subjectNum) {
      //found it
      // currentSubjectID = subjects[i][0];
      return subjectObj;
    }
  }
}
//////
function findSubjectByAge(n, age) {
  // console.log(n, age);
  const ageGroupArray = ageSortedSubjects[age - 1];

  for (let i = 0; i < ageGroupArray.length; i++) {
    let subjectObj = ageGroupArray[i];
    if (subjectObj.subjectNum == n) {
      //we found it
      return subjectObj;
    }
  }
}

function checkSubjectID() {
  resetAllInput();
  // const subjectNum = document.querySelector('#name').value;
  const subjectNum = parseInt(document.getElementById('subjectNumOptions').value);
  // const ageGroup = ageYearOptions.options[ageYearOptions.selectedIndex].value;
  const ageGroup = parseInt(document.getElementById('ageYearOptions').value);

  let match = false;

  //now find the subject with age and subject numbe
  subject = findSubjectByAge(subjectNum, ageGroup);

  if (subject != null) {
    //this is not a new subject
    newSubject = false;
    experiment.uniqueId = subject.uniqueId;
    document.getElementById('subjectNumOptions').disabled = false;
    document.querySelector('#generateNewIDButton').classList.remove('disabled');
    document.querySelector('#subjectInfoLabel').innerHTML = "This is an existing subject. Please make sure the info below is correct.";
    const ageMonthOptions = document.getElementById('ageMonthOptions');
    // ageMonthOptions.options[ageMonthOptions.selectedIndex].value = subjectObj.age.month;
    ageMonthOptions.value = subject.age.month;

    const genderOptions = document.getElementById('genderOptions');
    // genderOptions.options[genderOptions.selectedIndex].value = subjectObj.gender;
    genderOptions.value = subject.gender;
    //populate the notes if there's any
    // if(subject.notes != null){
    //   document.querySelector('#notesInput').value = subject.notes;
    // }
    let task = 0;
    if (subject.tasks.one == 1) {
      document.querySelector('#rabbitTaskButton').classList.add("disabled");
      document.querySelector('#rabbitTaskCheckbox').classList.add('checked');
      task++;
    }
    if (subject.tasks.two == 1) {
      document.querySelector('#treeTaskButton').classList.add("disabled");
      document.querySelector('#treeTaskCheckbox').classList.add('checked');
      task++;
    }
    if (subject.tasks.three == 1) {
      document.querySelector('#rainTaskButton').classList.add("disabled");
      document.querySelector('#rainTaskCheckbox').classList.add('checked');
      task++;
    }
    if (task == 3) {
      document.querySelector('#tryAgain').style.display = "block";
    }
    match = true;
    // $inputGender.style.display = "block";
    fadeIn($inputGender);
  } else {
    //this is a new subject
    newSubject = true;
    console.log("nothing matching");
    generateNewID();
    document.querySelector('#subjectInfoLabel').innerHTML = "The subject number you entered did not match our record so we generated a new one. Please select their gender."
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
  // const notes = document.querySelector("#notesInput").value;
  //
  // const germanOn = document.querySelector('#languageToggleSwitch').checked;
  const language = lang;
  //get the current date and time
  const timestamp = Date.now();

  //store it in the variable experiment
  experiment.subjectNum = subjectNum;
  experiment.lang = language;
  // experiment.timeLimit = timeLimit;
  experiment.timezone = timezone;
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
  if(!newSubject && subject != null){
    experiment.tasks = {
      one: subject.tasks.one,
      two: subject.tasks.two,
      three: subject.tasks.three
    }
  }
  experiment.gender = gender;
  // experiment.notes = notes;
}

function addNewSubject(e) {

  postData('./subjects', {
      experiment
    })
    // postData('./raindots',{data})
    .then((pdata) => {
      // console.log("here's the pdata: " + pdata.insertedId); // JSON data parsed by `response.json()` call
      //get the newly inserted id to pass as with the url
      experiment.uniqueId = pdata.insertedId;
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
    });
}

function updateExistingSubjectInfo(){
  let data = {};
  data.id = experiment.uniqueId;
  data.experiment = experiment;
  //update the database
  storeSubject.dispatch({
      type: "UPDATE_DATA",
      payload: {
        data: data
      }
  });
}

function startTheTask(e) {

  if(document.getElementById('genderOptions').value == "null"){
    //highlight the gender option
    console.log("check the gender:"+document.getElementById('genderOptions').value+"!!!");
    document.getElementById('genderOptions').classList.add("error");
    const genderOptionContainer = document.getElementById('genderOptionRow');
    let validationText = document.createElement('label');
    validationText.innerHTML = "Please select gender.";
    validationText.classList.add('error');
    validationText.id = "errorMsg";
    genderOptionContainer.appendChild(validationText);
    return;
  }
  //add the new subject to the database if this subject is new
  updateSubject();

  if (newSubject) {
    addNewSubject(e);
  } else {
    updateExistingSubjectInfo();
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
}

function isEmpty(obj) {
  for (var x in obj) {
    return false;
  }
  return true;
}



////////////
//some utility functions for fading in and out using Greensock animation library (GSAP)
function fadeIn(elem, duration = 1, delay = 0, display = "block") {
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

function fadeOutInterface(elem, onCompleteParam, delay = 0) {
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
  // console.log(param + "?subject=" + experiment.subjectNum + "&age=" + experiment.age.year + "&id=" + experiment.uniqueId);
  location.href = param+"?subject="+experiment.subjectNum+"&age="+experiment.age.year+"&id="+experiment.uniqueId;
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
