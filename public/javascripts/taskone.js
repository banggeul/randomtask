//import the data storing script
import store from '/utils/subject_storage.js'

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
const subjectNum = urlParams.get('subject');
let subjects = [];
let sequenceSet = [];
//generate some fake sequenceSet for testing purpose
for(let i=0; i < 50; i++){
  let sequence = [];
  for(let j=0; j < 41; j++){
    sequence.push(Math.random() > 0.5 ? 1 : 0);
  }
  sequenceSet.push(sequence);
}
// fetch the subjectNumbers collection
async function fetchSubject(){
  let response = await fetch('/subjects');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

fetchSubject().then((data) => {
  for (let i in data) {
    let innerarray = [];
    for (let j in data[i]) {
      innerarray.push(data[i][j]);
    }
    subjects.push(innerarray);
  }

  //now do something with it
  currentSubject = findSubject(subjectNum);
  //set the sequence based on the subjectNumber
  //but for now just set it as the first one
  //load the page content

  document.querySelector('#doit').addEventListener('click', ()=>{
    currentSubject.tasks.one = 1;
    experiment.id = currentSubjectID;
    experiment.data = [currentSubject];
    //update the database
    store.dispatch({
      type: "UPDATE_DATA",
      payload: {
        data: experiment
      }
    });
  })

})
.catch((e) =>
  console.log(e)
);

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
