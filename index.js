const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.get('/', (req, res) => {
  res.send('Welcome to Startup-Forge server!');
});

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// singleton connection — reused across serverless invocations
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to MongoDB');
  }
}

async function run() {
  await connectDB();

  const database = client.db("startup-forge");
  const userCollection = database.collection("user");
  const startupsCollection = database.collection("startups");
  const opportunitiesCollection = database.collection("opportunities");
  const applicationsCollection = database.collection("applications");
  const plansCollection = database.collection("plans");
  const subscriptionCollection = database.collection("subscriptions");
  const sessionCollection = database.collection("session");

  const verifyToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) return res.status(401).send({ message: 'unauthorized access' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'unauthorized access' });
    next();
  };

  app.get('/users', verifyToken, async (req, res) => {
    try {
      await connectDB();
      const { email } = req.query;
      const query = email ? { email } : {};
      const result = await userCollection.find(query).toArray();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/startups', async (req, res) => {
    try {
      await connectDB();
      const result = await startupsCollection.find().toArray();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/startups', async (req, res) => {
    try {
      await connectDB();
      const startup = req.body;
      const newStartup = { ...startup, createdAt: new Date() };
      const result = await startupsCollection.insertOne(newStartup);
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/my/startups', verifyToken, async (req, res) => {
    try {
      await connectDB();
      const query = {};
      if (req.query.founderId) query.founderId = req.query.founderId;
      const result = await startupsCollection.findOne(query);
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/startups/:id', async (req, res) => {
    try {
      await connectDB();
      const { id } = req.params;
      const result = await startupsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/startups/:id', async (req, res) => {
    try {
      await connectDB();
      const { id } = req.params;
      const updateData = req.body;
      const result = await startupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/opportunities', async (req, res) => {
    try {
      await connectDB();
      const opportunity = req.body;
      const newOpportunity = { ...opportunity, createdAt: new Date() };
      const result = await opportunitiesCollection.insertOne(newOpportunity);
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/opportunities/:id', async (req, res) => {
    try {
      await connectDB();
      const { id } = req.params;
      const updateData = req.body;
      const result = await opportunitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/opportunities/:id', verifyToken, async (req, res) => {
    try {
      await connectDB();
      const id = req.params.id;
      const result = await opportunitiesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/opportunities/:id', async (req, res) => {
    try {
      await connectDB();
      const { id } = req.params;
      const result = await opportunitiesCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/applications', async (req, res) => {
    try {
      await connectDB();
      const application = req.body;
      const newApplication = { ...application, createdAt: new Date() };
      const result = await applicationsCollection.insertOne(newApplication);
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/applications', verifyToken, async (req, res) => {
    try {
      await connectDB();
      const query = {};
      if (req.query.userId) query.applicantId = req.query.userId;
      if (req.query.founderId) query.founderId = req.query.founderId;
      if (req.query.opportunityId) query.opportunityId = req.query.opportunityId;
      const result = await applicationsCollection.find(query).toArray();
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/opportunities', async (req, res) => {
    try {
      await connectDB();
      const query = {};
      if (req.query.founderId) query.founderId = req.query.founderId;
      if (req.query.search) {
        const regex = { $regex: req.query.search, $options: 'i' };
        query.$or = [{ roleTitle: regex }, { requirements: regex }];
      }
      if (req.query.workType) {
        const types = Array.isArray(req.query.workType) ? req.query.workType : [req.query.workType];
        query.workType = { $in: types };
      }
      if (req.query.industry) {
        const industries = Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry];
        query.industry = { $in: industries };
      }
      if (req.query.opportunityId) query.opportunityId = req.query.opportunityId;

      if (req.query.page) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        const total = await opportunitiesCollection.countDocuments(query);
        const result = await opportunitiesCollection.find(query).skip(skip).limit(limit).toArray();
        return res.send({ data: result, total, page, totalPages: Math.ceil(total / limit) });
      }

      const result = await opportunitiesCollection.find(query).toArray();
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/applications/:id', async (req, res) => {
    try {
      await connectDB();
      const id = req.params.id;
      const updatedApplication = req.body;
      const result = await applicationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: updatedApplication.status } }
      );
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/users/:id', async (req, res) => {
    try {
      await connectDB();
      const id = req.params.id;
      const updatedUser = req.body;
      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: updatedUser.status } }
      );
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/plans', async (req, res) => {
    try {
      await connectDB();
      const query = {};
      if (req.query.plan_id) query.id = req.query.plan_id;
      const plan = await plansCollection.findOne(query);
      if (!plan) return res.status(404).json({ message: 'Plan not found' });
      res.send(plan);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/subscriptions', async (req, res) => {
    try {
      await connectDB();
      const data = req.body;
      const subsInfo = { ...data, createdAt: new Date() };
      await subscriptionCollection.insertOne(subsInfo);
      const updateResult = await userCollection.updateOne(
        { email: data.email },
        { $set: { plan: data.planId } }
      );
      res.send(updateResult);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

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
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;