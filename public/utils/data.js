// Example POST method implementation:
export async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}


export async function putData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response; // parses JSON response into native JavaScript objects
}

// Example GET method implementation:
export async function getData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "content-type": "application/json",
    },
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
