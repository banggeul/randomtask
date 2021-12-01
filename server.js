const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
require('dotenv').config();

//make the express app
const app = express();
//register view engine
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;
const dbConnectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';

//we need the bodyParser to parse the data coming with the html form
app.use(express.urlencoded({extended:true}));
app.use(express.json({limit:'1mb'}));


var resultArray = [];

//make a use of the public folder for the static files
app.use(express.static('public'));

MongoClient.connect(dbConnectionString,{ useNewUrlParser: true, useUnifiedTopology: true})
  .then(client=>{
    console.log('Connected to Database dbRandom');
    const db = client.db('dbRandom');
    const collectionRabbits = db.collection('rabbits');
    const collectionRaindots = db.collection('raindots');
    const collectionApples = db.collection('apples');
    const collectionSubjects = db.collection('subjectNumbers');
    const collectionSequence = db.collection('sequenceSet');
    // const collection = db.collection('raindots');

    app.get('/', (req, res) => {
      // db.collection('subjectNumbers').find().toArray()
      //   .then(results =>{
      //     // res.json(results);
      //     console.log(results);
      //     var subjectNums = results;
      //     res.render('index', {title: 'Experiments', subjectNums: subjectNums} );
      //   })
      res.render('index', {title: 'Experiments', myVar: "what?"} );
    })

    app.get('/task1', (req, res) => {
        res.render('task1', {title: 'Task One'} );
      // res.render('task1');
    })

    app.get('/task2', (req, res) => {
      res.render('task2');
    })

    app.get('/task3', (req, res) => {
      res.render('task3');
    })

    app.get('/logRabbits', (req, res) => {
      // res.sendFile(__dirname + '/public/');
      db.collection('rabbits').find().toArray()
        .then(results =>{
          console.log(results);
          res.json(results);
        })
        .catch(error=>console.error(error));
    })
    app.get('/logRaindots', (req, res) => {
      // res.sendFile(__dirname + '/public/');
      db.collection('raindots').find().toArray()
        .then(results =>{
          console.log(results);
          res.json(results);
        })
        .catch(error=>console.error(error));
    })
    app.get('/logApples', (req, res) => {
      // res.sendFile(__dirname + '/public/');
      db.collection('apples').find().toArray()
        .then(results =>{
          console.log(results);
          res.json(results);
        })
        .catch(error=>console.error(error));
    })
    app.get('/sequence', (req, res) => {
      //do something
      // res.sendFile(__dirname + '/public/');
      db.collection('sequenceSet').find().toArray()
        .then(results =>{
          res.json(results);
          console.log(results);
        })
        .catch(error=>console.error(error));
    })
    app.get('/subjects', (req, res) => {
      //do something
      // res.sendFile(__dirname + '/public/');
      db.collection('subjectNumbers').find().toArray()
        .then(results =>{
          res.json(results);
          console.log(results);
        })
        .catch(error=>console.error(error));
    })

    //POST
    app.post('/rabbits',(req,res)=>{
      console.log(req.body);
      collectionRabbits.insertOne(req.body)
        .then(result=>{
          console.log(result);
          res.json(result);
          // res.redirect('/')
        })
        .catch(error => console.error(error));
    })

    app.post('/raindots',(req,res)=>{
      console.log(req.body);
      collectionRaindots.insertOne(req.body)
        .then(result=>{
          console.log(result);
          res.json(result);
          // res.redirect('/')
        })
        .catch(error => console.error(error));
    })

    app.post('/apples',(req,res)=>{
      console.log(req.body);
      collectionApples.insertOne(req.body)
        .then(result=>{
          console.log(result);
          res.json(result);
          // res.redirect('/')
        })
        .catch(error => console.error(error));
    })

    app.post('/subjects',(req,res)=>{
      console.log(req.body);
      collectionSubjects.insertOne(req.body)
        .then(result=>{
          console.log(result);
          res.json(result);
          // res.redirect('/')
        })
        .catch(error => console.error(error));
    })

    app.put('/update_subject', (req, res)=>{
      res.send('Got a PUT request');
      console.log(req.body.data.id);
      console.log(req.body.data.data);
      let o_id = new mongo.ObjectId(req.body.data.id);
      let collection = db.collection("subjectNumbers");
      collection.findOneAndUpdate({_id: o_id}, {$set: {data: req.body.data.data}}, {upsert: false}, function(err,doc) {
       if (err) { throw err; }
       else {
         console.log("Updated");
       }
     });
    })

  })
  .catch(error => console.error(error));

app.listen(port, function(){
  console.log(`listening on ${port}`);
})

// export default { resultArray: resultArray }
