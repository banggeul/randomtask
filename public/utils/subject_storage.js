import {postData, getData, putData} from './data.js'

function createStorage(reducer) {
  let currentState = reducer(undefined, {});
  return {
    getState:()=>currentState,
    dispatch:action => {
      currentState = reducer(currentState, action);
    }
  }
}

const initialState = {
  data: []
}

const dataReducer = (state=initialState, action) => {
  switch(action.type) {
    case 'ADD_DATA':
      {
        const data = [...state.data, action.payload.data];
        postData('./subjects',{data})
        // postData('./raindots',{data})
        .then((data) => {
          console.log("here's the data: " + data); // JSON data parsed by `response.json()` call
        });
        return {data};
      }
    case 'REMOVE_DATA':
      {
        const data = state.data.filter(fav => fav.id!==action.payload.data.id);
        return {data};
      }
    case 'UPDATE_DATA':
    {
      const data = action.payload.data;
      putData('./update_subject',{data})
      .then((data) => {
        console.log("here's the data: " + data); // JSON data parsed by `response.json()` call
      });
      return {data};
    }
    default:

    return state;
  }
  return state;
};

const storage = createStorage(dataReducer);

export default storage;
