var currentSubject;
function updateCurrentSubject(s){
  currentSubject = s;
}
function getCurrentSubject(){
  return currentSubject;
}
export {
  currentSubject,
  updateCurrentSubject,
  getCurrentSubject
};
