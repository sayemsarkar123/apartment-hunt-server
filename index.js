const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 4000;
const ObjectId = require('mongodb').ObjectId;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ny61p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const housesCollection = client.db("apartmentHunt").collection("houses");
  const servicesCollection = client.db("apartmentHunt").collection("services");
  const bookingsCollection = client.db("apartmentHunt").collection("bookings");
  const adminCollection = client.db("apartmentHunt").collection("adminList");
  app.get('/getHouses', (req, res) => {
    housesCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.get('/getServices', (req, res) => {
    servicesCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.get('/getBookings', (req, res) => {
    bookingsCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.post('/addBooking', (req, res) => {
    bookingsCollection.insertOne(req.body).then(result => res.send(result.insertedCount > 0));
  });
  app.patch('/updateStatus', (req,res)=>{
    bookingsCollection.updateOne(
        {_id : ObjectId(req.body.id)},
        {
          $set: { status: req.body.newStatus},
        }
    )
    .then(result =>{
        res.send(result.modifiedCount > 0)
    })
  })
  app.post('/addAdmin', (req, res) => {
    adminCollection.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount > 0)
    })
  })
  app.get('/getAdminEmails', (req, res) => {
    adminCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
    })
  })

});


app.listen(PORT, () => console.log(`Our app is running on port ${PORT}`));