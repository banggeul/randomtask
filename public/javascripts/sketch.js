//import the data storing script
import store from '/utils/subject_storage.js'

//get the current data stored, unpack it as object
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};
//populate it with some fake data for testing purpose
// let subjects = [
//   {
//     id:"12345",
//     subjectNum:"1",
//     age: { year: "3", month:"5"},
//     gender: "female",
//     lang: "en",
//     tasks: { one: "1", two: "1", three: "0"}
//   },
//   {
//     id:"22325",
//     subjectNum:"2",
//     age: { year: "5", month:"8"},
//     gender: "male",
//     lang: "en",
//     tasks: { one: "1", two: "1", three: "1"}
//   },
//   {
//     id:"32349",
//     subjectNum:"3",
//     age: { year: "4", month:"1"},
//     gender: "female",
//     lang: "de",
//     tasks: { one: "1", two: "0", three: "0"}
//   }];
let subjects = [];
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
    });
  })
  .catch((err) => {
    console.log("something went wrong");
  });

//get the reference to the HTML elements we need
const $generateNewID = document.querySelector('#generateNewIDButton');
const $subjectInfoInput = document.querySelector('#subjectInfoInput');
// const $subjectInfo = document.querySelector('#subjectInfo');
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
//bind the click event listeners to the buttons
$generateNewID.addEventListener('click', generateNewID);
function generateNewID(){
  //create a new subject id;
  let newID = subjects.length + 1;
  //put it in the form
  document.querySelector('#name').value = newID;
  resetAllInput();
  if(!$checkSubjectID.classList.contains('disabled')){
    $checkSubjectID.classList.add('disabled');
  }
  document.querySelector('#subjectInfoLabel').innerHTML = "This is a new subject. Please enter the info below."
  $subjectInfoInput.style.display = "block";
}

function resetAllInput() {
  document.querySelector('#rabbitTaskButton').classList.remove("disabled");
  document.querySelector('#rabbitTaskCheckbox').classList.remove('checked');
  document.querySelector('#treeTaskButton').classList.remove("disabled");
  document.querySelector('#treeTaskCheckbox').classList.remove('checked');
  document.querySelector('#rainTaskButton').classList.remove("disabled");
  document.querySelector('#rainTaskCheckbox').classList.remove('checked');
  document.querySelector('#languageToggleSwitch').checked = false;
  document.querySelector('#tryAgain').style.display = "none";
}

document.querySelector('#name').addEventListener('change',function(){
  //if there's something in the subjectID then enable the check button
  if(this.value > 0 && $checkSubjectID.classList.contains('disabled')){
    $checkSubjectID.classList.remove('disabled');
  }
})
//when the checkID button is pressed
//it checks the id in the database and populate all the inputs
$checkSubjectID.addEventListener('click', checkSubjectID);
function checkSubjectID(){
  resetAllInput();
  const subjectNum = document.querySelector('#name').value;
  let match = false;
  for(let i=0; i < subjects.length; i++){
    if(subjects[i].subjectNum == subjectNum){
      document.querySelector('#subjectInfoLabel').innerHTML = "This is an existing subject. Please make sure the info below is correct."
      document.querySelector('#ageYear').value = subjects[i].age.year;
      document.querySelector('#ageMonth').value = subjects[i].age.month;
      const genderOptions = document.getElementById('genderOptions');
      genderOptions.options[genderOptions.selectedIndex].value = subjects[i].gender;
      let task = 0;
      if(subjects[i].tasks.one == 1){
        document.querySelector('#rabbitTaskButton').classList.add("disabled");
        document.querySelector('#rabbitTaskCheckbox').classList.add('checked');
        task++;
      }
      if(subjects[i].tasks.two == 1){
        document.querySelector('#treeTaskButton').classList.add("disabled");
        document.querySelector('#treeTaskCheckbox').classList.add('checked');
        task++;
      }
      if(subjects[i].tasks.three == 1){
        document.querySelector('#rainTaskButton').classList.add("disabled");
        document.querySelector('#rainTaskCheckbox').classList.add('checked');
        task++;
      }
      if(task == 3){
        document.querySelector('#tryAgain').style.display = "block";
      }
      if(subjects[i].lang == "de"){
        document.querySelector('#languageToggleSwitch').checked = true;
      }
      match = true;
      $subjectInfoInput.style.display = "block";
      break;
    }
  }

  if(!match){
    //if nothing has been matched then it means it's new.
    console.log("nothing matching")
    generateNewID();
    document.querySelector('#subjectInfoLabel').innerHTML = "The subject number did not match our record. So we generated a new one for you. Please enter the info below."
  }

}

//bind the click event listener with the submit button
// $getUserContext.addEventListener('click', getUserContext);
//when the submit button is clicked do this
function addNewSubject() {
  //get all the values from the input elements
  const subjectNum = document.querySelector('#name').value;
  const ageYear = document.querySelector('#ageYear').value;
  const ageMonth = document.querySelector('#ageMonth').value;
  const genderOptions = document.getElementById('genderOptions');
  // console.log(genderOptions.options)
  const gender = genderOptions.options[genderOptions.selectedIndex].value;
  const germanOn = document.querySelector('#languageToggleSwitch').checked;
  const lang = germanOn ? "de" : "en";
  //get the current date and time
  const timestamp = Date.now();
  //store it in the variable experiment
  experiment.subjectNum = subjectNum;
  experiment.lang = lang;
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
  //then store it to the storage which will post it to the database
  store.dispatch({
    type: !isEmpty(experiment) ? "ADD_DATA" : "REMOVE_DATA",
    payload: {
      data: experiment
    }
  });

}

function startTheTask(e){
  addNewSubject();
  // location.
}

function isEmpty(obj) {
   for (var x in obj) { return false; }
   return true;
}
