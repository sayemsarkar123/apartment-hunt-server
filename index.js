const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ny61p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const housesCollection = client.db("apartmentHunt").collection("houses");
  const servicesCollection = client.db("apartmentHunt").collection("services");
  const bookingsCollection = client.db("apartmentHunt").collection("bookings");
  const adminCollection = client.db("apartmentHunt").collection("adminList");
  app.post("/addHouse", (req, res) => {
    const file = req.files.file;
    const {title, location, price, bedroom, bathroom} = req.body;
    const img = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(file.data.toString("base64"), "base64"),
    };
    housesCollection
      .insertOne({ title, location, price, bedroom, bathroom, img })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  app.get('/getHouses', (req, res) => {
    housesCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.get('/getHomeDetails/:id', (req, res) => {
    const { id } = req.params;
    housesCollection.find({_id: ObjectId(id)}).toArray((error, documents) => res.send(documents[0]));
  });
  app.get('/getServices', (req, res) => {
    servicesCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.get('/getBookings', (req, res) => {
    bookingsCollection.find({}).toArray((error, documents) => res.send(documents));
  });
  app.get('/getUserBookings', (req, res) => {
    const {email} = req.query;
    bookingsCollection.find({email}).toArray((error, documents) => res.send(documents));
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
 app.get('/checkAdmin', (req, res) => {
   const {email} = req.query;
   adminCollection.find({email})
   .toArray((err, documents) => res.send(documents.length > 0))
 })

});


app.listen(PORT, () => console.log(`Our app is running on port ${PORT}`));