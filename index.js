var express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtqtqqh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoriesCollection = client
      .db("libraryDB")
      .collection("categories");
    const allBooksCollection = client.db("libraryDB").collection("allBooks");
    const readBookCollection = client.db("libraryDB").collection("readBook");
    const borrowBookCollection = client
      .db("libraryDB")
      .collection("borrowBook");

    //get book categories using get method
    app.get("/categories", async (req, res) => {
      const cursor = categoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all books by using get method
    app.get("/all-books", async (req, res) => {
      const cursor = allBooksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get books category by using get method
    app.get("/explore/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const cursor = allBooksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get single book by using get method
    app.get("/explore/id/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allBooksCollection.findOne(query);
      res.send(result);
    });

    //get single book by name using get method
    app.get("/read-book/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const result = await readBookCollection.findOne(query);
      res.send(result);
    });

    //get borrowed books by user's email
    app.get("/borrowed-books/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = borrowBookCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // add-book by post method
    app.post("/add-book", async (req, res) => {
      const newBook = req.body;
      const result = await allBooksCollection.insertOne(newBook);
      res.send(result);
    });

    // add borrow book by using post method
    app.post("/borrow-book", async (req, res) => {
      const newBook = req.body;
      const result = await borrowBookCollection.insertOne(newBook);
      res.send(result);
    });

    // Update single Book by id using put method
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newUpdateBook = req.body;
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          name: newUpdateBook.name,
          authorName: newUpdateBook.authorName,
          category: newUpdateBook.category,
          ratings: newUpdateBook.ratings,
          photo: newUpdateBook.photo,
          details: newUpdateBook.details,
          quantity: newUpdateBook.quantity,
        },
      };
      const result = await allBooksCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    // delete borrow book card by using delete method
    app.delete("/borrowed-card/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await borrowBookCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
