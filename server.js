/////////////////////////////////////////////
// Import Our Dependencies
/////////////////////////////////////////////
require("dotenv").config(); // Load ENV Variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const methodOverride = require("method-override");
const mongoose = require("mongoose");

/////////////////////////////////////////////
// Database Connection
/////////////////////////////////////////////
// Setup inputs for our connect function
const DATABASE_URL = process.env.DATABASE_URL;
const CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Establish Connection
mongoose.connect(DATABASE_URL, CONFIG);

// Events for when connection opens/disconnects/errors
mongoose.connection
  .on("open", () => console.log("Connected to Mongoose"))
  .on("close", () => console.log("Disconnected from Mongoose"))
  .on("error", (error) => console.log(error));

////////////////////////////////////////////////
// Our Models
////////////////////////////////////////////////
// pull schema and model from mongoose
const { Schema, model } = mongoose;

// make animals schema
const animalsSchema = new Schema({
  name: String,
  species: String,
    extinct: Boolean,
    location: String,
    lifeExpectancy: Number
});

// make animal model
const animal = model("animal", animalsSchema);

/////////////////////////////////////////////////
// Create our Express Application Object
/////////////////////////////////////////////////
const app = express();

/////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////
app.use(morgan("tiny")); //logging
app.use(methodOverride("_method")); // override for put and delete requests from forms
app.use(express.urlencoded({ extended: true })); // parse urlencoded request bodies
app.use(express.static("public")); // serve files from public statically

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("your server is running... better catch it.");
});

app.get("/animals/spec", (req, res) => {
  const startanimals = [
    {name:"Giraffe",species:"Familiaris", extinct:false, location: "sub-Saharan Africa", lifeExpectancy: 25},
  {name:"Peacock", species:"Cichla temensis", extinct:false, location: "India", lifeExpectancy: 24},
  {name:"Orca",species: "Bushbaby", extinct:false, location: "Ocean", lifeExpectancy: 29},
  {name:"Panda",species: "Gibbon", extinct:false, location: "Southwest China", lifeExpectancy: 20},
  {name:"Lion",species: "Megabat", extinct:false, location: "Africa", lifeExpectancy: 23},
]

  // Delete all animals
  animal.remove({}, (err, data) => {
    // Spec Starter animals
    animal.create(startanimals, (err, data) => {
      // send created animals as response to confirm creation
      res.json(data);
    });
  });
});

// index route
app.get("/animals", (req, res) => {
    animal.find({}, (err, animals) => {
      res.render("animals/index.ejs", { animals });
    });
  });

  //new route
app.get("/animals/new", (req, res) => {
    res.render("animals/new.ejs")
})

// create route
app.post("/animals", (req, res) => {
    // check if the extinct property should be true or false
    req.body.extinct = req.body.extinct === "on" ? true : false
    // create the new animal
    animal.create(req.body, (err, animal) => {
        // redirect the user back to the main animals page after animal created
        res.redirect("/animals")
    })
})

// edit route
app.get("/animals/:id/edit", (req, res) => {
    // get the id from params
    const id = req.params.id
    // get the animal from the database
    animal.findById(id, (err, animal) => {
        // render template and send it animal
        res.render("animals/edit.ejs", {animal})
    })
})

//update route
app.put("/animals/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // check if the extinct property should be true or false
    req.body.extinct = req.body.extinct === "on" ? true : false
    // update the animal
    animal.findByIdAndUpdate(id, req.body, {new: true}, (err, animal) => {
        // redirect user back to main page when animal 
        res.redirect("/animals")
    })
})

app.delete("/animals/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // delete the animal
    animal.findByIdAndRemove(id, (err, animal) => {
        // redirect user back to index page
        res.redirect("/animals")
    })
})

// show route
app.get("/animals/:id", (req, res) => {
    // get the id from params
    const id = req.params.id

    // find the particular animal from the database
    animal.findById(id, (err, animal) => {
        // render the template with the data from the database
        res.render("animals/show.ejs", {animal})
    })
})

//////////////////////////////////////////////
// Server Listener
//////////////////////////////////////////////
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`));
