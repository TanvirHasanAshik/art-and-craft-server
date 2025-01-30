const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uvnlo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a new MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("art-craft");
        const craftItems = database.collection("craft-items");

        // get all craft items
        app.get('/all-craft-items', async (req, res) => {
            const skip = parseInt(req.query.skip);
            const result = await craftItems.find({}).skip(skip || 0).limit(5).toArray();
            res.send(result);
        });

        // get single craft data by craft id;
        app.get('/single-craft-item/:id', async (req, res) => {
            const id = req.params.id;
            const result = await craftItems.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        // get craft data by craft category
        app.get('/craft-category-data', async (req, res) => {
            const query = req.query.category;
            const result = await craftItems.find({ categoryName: query }).toArray();
            res.send(result);
        })

        // get specific user added data by email
        app.get('/my-craft', async (req, res) => {
            const query = req.query.email;
            const result = await craftItems.find({ email: query }).toArray();
            res.send(result);
        })

        // {insert a data in craftItems collection}
        app.post('/craft-items', async (req, res) => {
            const item = req.body;
            const result = await craftItems.insertOne(item);
            res.send(result);
        });

        // update a data added by user
        app.put('/update-a-craft/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const newData = req.body;
            const updateData = { $set: newData }
            const result = await craftItems.updateOne(filter, updateData);

            res.send(result);
        })

        // delete a item;
        app.delete('/delete-craft-item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await craftItems.deleteOne(query);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});