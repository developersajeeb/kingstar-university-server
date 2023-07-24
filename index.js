const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//Middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9amltv.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const usersCollections = client.db('kingStarUniversity').collection('users');
        const universityCollections = client.db('kingStarUniversity').collection('university');

        // Add New User
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const query = { email: newUser.email }
            const existingUser = await usersCollections.findOne(query);
            if (existingUser) {
                return res.send({ massage: 'user already exists' })
            }
            const result = await usersCollections.insertOne(newUser);
            res.send(result)
        })

        //TODO email query

        //Add University
        app.post('/university', async (req, res) => {
            const newUniversity = req.body;
            const result = await universityCollections.insertOne(newUniversity);
            res.send(result)
        })

        // Get University
        app.get('/university', async (req, res) => {
            const cursor = await universityCollections.find().toArray();
            res.send(cursor)
        })

        // Get User
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollections.findOne(query);
            res.send(result)
        })

        // Update user info
        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedUser = req.body;
            const newClass = {
                $set: {
                    className: updatedUser.className,
                    classImg: updatedUser.classImg,
                    availableSeats: updatedUser.availableSeats,
                    price: updatedUser.price,
                    description: updatedUser.description,
                }
            }
            const result = await classCollation.updateOne(filter, newClass, options);
            res.send(result)
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


app.get('/', (req, res) => {
    res.send('college is running')
})

app.listen(port, () => {
    console.log(`College booking server is running: ${port}`);
})