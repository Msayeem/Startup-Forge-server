const express = require('express');
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
  res.send('Welcome to Startup-Forge server!')
})





const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const database=client.db("startup-forge");
const userCollection=database.collection("user");
const startupsCollection=database.collection("startups");
const opportunitiesCollection=database.collection("opportunities");
const applicationsCollection=database.collection("applications");



app.post('/startups', async(req, res)=>{
  const startup=req.body;
  const newStartup={
    ...startup,
    createdAt: new Date()
  }
  const result=await startupsCollection.insertOne(startup);
  res.send(result)
})

app.get('/my/startups', async(req, res)=>{
     const query = {};
      if (req.query.founderId) {
        query.founderId = req.query.founderId
      }
      const result = await startupsCollection.findOne(query);
      res.send(result)
})


app.delete('/startups/:id', async(req, res)=>{
  const {id}=req.params;
const result =await startupsCollection.deleteOne({_id: new ObjectId(id)});
res.json(result);
})


 app.patch('/startups/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const result = await startupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json(result);
    });

app.post('/opportunities', async(req, res)=>{
  const opportunity=req.body;
  const newOpportunity={
    ...opportunity,
    createdAt: new Date()
  }

  const result=await opportunitiesCollection.insertOne(newOpportunity);
  res.send(result)
})


   app.get('/opportunities', async (req, res) => {
 
      const query = {};

      if (req.query.opportunityId) {
        query.opportunityId = req.query.opportunityId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }

      const cursor = opportunitiesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    app.get('/opportunities/:id', async(req, res)=>{
          const id = req.params.id;
        const query = {
          _id: new ObjectId(id)
        }
        const result = await opportunitiesCollection.findOne(query);
        res.send(result)
    })


    app.post('/applications', async(req, res)=>{
const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date()
      }
      const result = await applicationsCollection.insertOne(newApplication);
      res.send(result)
    })


      app.get('/applications', async (req, res) => {
      const query = {}
      if (req.query.userId) {
        query.applicantId = req.query.userId;
      }

      console.log(req.user, req.query.userId)

      if (req.query.opportunityId) {
        query.opportunityId = req.query.opportunityId
      }
      const cursor = applicationsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })



      app.get('/applications', async (req, res) => {
      const query = {}
      if (req.query.founderId) {
        query.founderId = req.query.founderId;
      }

      if (req.query.opportunityId) {
        query.opportunityId = req.query.opportunityId
      }
      const cursor = applicationsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })


      app.get('/opportunities', async (req, res) => {
      const query = {}
      if (req.query.founderId) {
        query.founderId = req.query.founderId;
      }

      if (req.query.opportunityId) {
        query.opportunityId = req.query.opportunityId
      }
      const cursor = opportunitiesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })


//     app.patch('/applications/:id', async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const allowedStatuses = ['applied', 'review', 'shortlisted', 'rejected', 'offered'];
//   if (!status || !allowedStatuses.includes(status.toLowerCase())) {
//     return res.status(400).send({ message: 'Invalid status value' });
//   }

//   const result = await applicationsCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { status } }
//   );

//   if (result.matchedCount === 0) {
//     return res.status(404).send({ message: 'Application not found' });
//   }

//   res.send({ message: 'Status updated successfully', result });
// });


    app.patch('/applications/:id', async(req, res)=>{
      const id=req.params.id;
      const updatedApplication=req.body;
      const filter={_id: new ObjectId(id)};
      const updatedDoc={
        $set:{
          status: updatedApplication.status
        }
      }
      const result=await applicationsCollection.updateOne(filter, updatedDoc)
    res.send(result);
    })













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})