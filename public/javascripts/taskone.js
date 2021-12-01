//import the data storing script
import store from '/utils/subject_storage.js'

//get the current data stored, unpack it as object
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
let sessionData = {};

const urlParams = new URLSearchParams(window.location.search);
const subjectNum = urlParams.get('subject');
let subjects = [];
// fetch the subjectNumbers collection
async function fetchSubject(){
  let response = await fetch('/subjects');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json().blob();
}

fetchSubject().then((blob) => {
  for (let i in blob) {
    let innerarray = [];
    for (let j in blob[i]) {
      innerarray.push(blob[i][j]);
    }
    subjects.push(innerarray);
  }
  console.log(subjects[0]);
})
.catch((e) =>
  console.log(e)
);
