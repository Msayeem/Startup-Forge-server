const express = require('express');
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


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

// async function run() {
//   try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect(()=>{
console.log('connecting to mongodb')
    }).catch(console.dir)

const database=client.db("startup-forge");
const userCollection=database.collection("user");
const startupsCollection=database.collection("startups");
const opportunitiesCollection=database.collection("opportunities");
const applicationsCollection=database.collection("applications");
const plansCollection=database.collection("plans");
const subscriptionCollection=database.collection("subscriptions");
const sessionCollection=database.collection("session");






const verifyToken= async(req ,res, next)=>{

  const authHeader=req.headers?.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'})
  }

  const token= authHeader.split(' ')[1];

    if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }

  

  next();
}



app.get('/users', verifyToken, async (req, res) => {
  const { email } = req.query;
  const query = email ? { email } : {};
  const result = await userCollection.find(query).toArray();
  res.json(result);
});

  //  app.get('/users', async(req, res)=>{
  //     const result=await userCollection.find().toArray();
  //     res.json(result);
  //   });



   app.get('/startups',  async(req, res)=>{
      const result=await startupsCollection.find().toArray();
      res.json(result);
    });


app.post('/startups', async(req, res)=>{
  const startup=req.body;
  const newStartup={
    ...startup,
    createdAt: new Date()
  }
  const result=await startupsCollection.insertOne(newStartup);
  res.send(result)
})

app.get('/my/startups',verifyToken,  async(req, res)=>{
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


app.patch('/startups/:id',  async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await startupsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  res.json(result);
});


//  app.patch('/startups/:id', async (req, res) => {
//       const { id } = req.params;
//       const updateData = req.body;
//       const result = await startupsCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updateData }
//       );
//       res.json(result);
//     });


//  app.patch('/startups/:id', async(req, res)=>{
//       const id=req.params.id;
//       const updatedStartup=req.body;
//       const filter={_id: new ObjectId(id)};
//       const updatedDoc={
//         $set:{
//           status: updatedStartup.status
//         }
//       }
//       const result=await startupsCollection.updateOne(filter, updatedDoc)
//     res.send(result);
//     })


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


    app.get('/opportunities/:id', verifyToken, async(req, res)=>{
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


    app.get('/applications', verifyToken, async (req, res) => {
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
  const query = {};

  if (req.query.founderId) {
    query.founderId = req.query.founderId;
  }

  if (req.query.search) {
    const regex = { $regex: req.query.search, $options: 'i' };
    query.$or = [
      { roleTitle: regex },   // ← fix: was 'title', should be 'roleTitle'
      { requirements: regex }
    ];
  }

  if (req.query.workType) {
    const types = Array.isArray(req.query.workType) ? req.query.workType : [req.query.workType];
    query.workType = { $in: types };
  }

  if (req.query.industry) {
    const industries = Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry];
    query.industry = { $in: industries };
  }

  if (req.query.opportunityId) {
    query.opportunityId = req.query.opportunityId;
  }

  // pagination — only applied when page param is present (so founderId queries still work as before)
  if (req.query.page) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const total = await opportunitiesCollection.countDocuments(query);
    const result = await opportunitiesCollection.find(query).skip(skip).limit(limit).toArray();

    return res.send({ data: result, total, page, totalPages: Math.ceil(total / limit) });
  }

  // no page param — return all (used by founder dashboard etc.)
  const result = await opportunitiesCollection.find(query).toArray();
  res.send(result);
});


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


    app.patch('/users/:id', async(req, res)=>{
      const id=req.params.id;
      const updatedUser=req.body;
      const filter={_id: new ObjectId(id)};
      const updatedDoc={
        $set:{
          status: updatedUser.status
        }
      }
      const result=await userCollection.updateOne(filter, updatedDoc)
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


   


app.get('/revenue/total', async (req, res) => {
  try {
    let total = 0, hasMore = true, startingAfter = undefined;

    while (hasMore) {
      const txns = await stripe.balanceTransactions.list({
        limit: 100,
        type: 'charge',
        ...(startingAfter && { starting_after: startingAfter }),
      });

      txns.data.forEach(txn => total += txn.amount);
      hasMore = txns.has_more;
      if (hasMore) startingAfter = txns.data.at(-1).id;
    }

    res.json({ totalRevenue: total / 100 });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});













    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// // }
// run().catch(console.dir);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


module.exports = app;