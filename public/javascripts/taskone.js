const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('subject');
console.log(myParam);
