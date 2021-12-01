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
})
.catch((e) =>
  console.log(e)
);

console.log(subjects[0]);
