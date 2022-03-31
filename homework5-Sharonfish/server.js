const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())

const mongoose = require('mongoose')

const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })

db.once('open', _ => {
    console.log('Database connected')
})

db.once('error', err => {
    console.log('connection error', err)
})

const Schema = mongoose.Schema
const apodSchema = Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
}, {collection: 'images'}) // Note that within our DB, we are storing these images in a collection called images. 

const APOD = mongoose.model('APOD', apodSchema)

app.get("/", function (req, res) {
  APOD.find().then((apods) => {
      res.json({ message: 'Return all apods', apods: apods})
  })
});

app.get("/favorite", function (req, res) {
  // GET "/favorite" should return our favorite image by highest rating
    APOD.find().sort({'rating': 'desc'}).exec((error, images) => {
    if (error) {
      console.log(error)
      res.send(500)
    } else {
      res.json({favorite: images[0]})
    }
  })
})

app.post("/add", function (req, res) {

    const apod = new APOD({
        title: req.body.title,
        url: req.body.url,
        rating: req.body.rating,
    })
    apod.save((error, document) => {
        if (error) {
            res.json({status: "failure"})
        } else {
            res.json({
                status: "success",
                id: apod._id,
                content: req.body
            })
        }
    })

});

app.delete("/delete", function (req, res) {
    APOD.deleteOne({ title: req.body.title }, (err) => {
        if (err) {
            res.json({status: "failed to delete"})
        } else {
            res.json({status: "Deleted successfully"})
        }
    })
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})