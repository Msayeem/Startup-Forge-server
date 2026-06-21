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
const plansCollection=database.collection("plans");
const subscriptionCollection=database.collection("subscriptions");




   app.get('/users', async(req, res)=>{
      const result=await userCollection.find().toArray();
      res.json(result);
    });


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


   


     app.patch('/opportunities/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const result = await opportunitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json(result);
    });


    app.get('/opportunities/:id', async(req, res)=>{
          const id = req.params.id;
        const query = {
          _id: new ObjectId(id)
        }
        const result = await opportunitiesCollection.findOne(query);
        res.send(result)
    })


    app.delete('/opportunities/:id', async(req, res)=>{
  const {id}=req.params;
const result =await opportunitiesCollection.deleteOne({_id: new ObjectId(id)});
res.json(result);
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
    const query = {};

    if (req.query.userId) {
        query.applicantId = req.query.userId;
    }

    if (req.query.founderId) {
        query.founderId = req.query.founderId;
    }

    if (req.query.opportunityId) {
        query.opportunityId = req.query.opportunityId;
    }

    const result = await applicationsCollection.find(query).toArray();
    res.send(result);
});


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


    app.get('/plans', async(req, res)=>{

      const query={};

      if(req.query.plan_id){
        query.id=req.query.plan_id
      }
      const plan=await plansCollection.findOne(query);
      res.send(plan)
    })


    app.post('/subscriptions', async(req, res)=>{
      const data=req.body;
      const subsInfo={
        ...data,
        createdAt: new Date()
      }

      const result=await subscriptionCollection.insertOne(subsInfo);
    
      const filter={email: data.email};
      const updateDocument={
        $set:{
          plan: data.planId
        }
      };

      const updateResult=await userCollection.updateOne(filter, updateDocument);
      res.send(updateResult)
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