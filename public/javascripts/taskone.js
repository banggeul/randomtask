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
