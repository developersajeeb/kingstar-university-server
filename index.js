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
        const userFeedback = client.db('kingStarUniversity').collection('feedback');

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

        //Get Single User With Email Query /user?email=user@example.com
        app.get('/user', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail };
            const result = await usersCollections.findOne(query);
            res.send(result);
        });

        //Get Users
        app.get('/users', async (req, res) => {
            const result = await usersCollections.find().toArray();
            res.send(result)
        })

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

        //Get Single University
        app.get('/university/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await universityCollections.findOne(query);
            res.send(result);
        })

        //Make University top & normal
        app.patch('/university/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const existingUniversity = await universityCollections.findOne(filter);

                if (!existingUniversity) {
                    return res.rank(404).send('University not found');
                }

                const newRank = existingUniversity.rank === 'top' ? 'normal' : 'top';
                const updateDoc = {
                    $set: {
                        rank: newRank
                    },
                };

                const result = await universityCollections.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.rank(500).send('Server error');
            }
        });

        // Get rank specific University
        app.get('/top-university/:rank', async (req, res) => {
            const result = await universityCollections.find({rank: req.params.rank}).toArray()
            res.send(result)
        })

        //Add Feedback
        app.post('/feedback', async (req, res) => {
            const newFeedback = req.body;
            const result = await userFeedback.insertOne(newFeedback);
            res.send(result);
        })

        //Get Feedback
        app.get('/feedback', async (req, res) => {
            const result = await userFeedback.find().toArray();
            res.send(result)
        })

        //Make Feedback status pending & approval
        app.patch('/feedback/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const existingFeedback = await userFeedback.findOne(filter);

                if (!existingFeedback) {
                    return res.status(404).send('Feedback not found');
                }

                const newStatus = existingFeedback.status === 'approval' ? 'pending' : 'approval';
                const updateDoc = {
                    $set: {
                        status: newStatus
                    },
                };

                const result = await userFeedback.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Server error');
            }
        });

        // Get status specific feedback
        app.get('/feedback/:status', async (req, res) => {
            const result = await userFeedback.find({status: req.params.status}).toArray()
            res.send(result)
        })


        // Update user info
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const options = { upsert: true };
            const updatedUser = req.body;
            const newUser = {
                $set: {
                    name: updatedUser.name,
                    photo: updatedUser.photo,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    university: updatedUser.university,
                    country: updatedUser.country,
                    city: updatedUser.city,
                    postal: updatedUser.postal,
                    bio: updatedUser.bio
                }
            }
            const result = await usersCollections.updateOne(filter, newUser, options);
            res.send(result)
        })

        // Email query for admin
        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollections.findOne({ email: email });

            if (!user) {
                res.send({ admin: false, message: 'User not found' });
                return;
            }
            const result = { admin: user.role === 'admin' };
            res.send(result);
        });


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