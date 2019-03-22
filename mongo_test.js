const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const MONGOURL="mongodb+srv://Client1:azerty@cluster0-xzpqp.mongodb.net/test?retryWrites=true";
const DBNAME="example";
var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(3000, () => {
  MongoClient.connect(MONGOURL, { useNewUrlParser: true }, (error, client) => {
    if(error) {
      throw error;
    }
    database = client.db(DBNAME);
    collection = database.collection("example");
    console.log("Connected to `" + DBNAME + "`!");

  });
});

// TODO: check if db exists and is populate
app.get("/movies/populate", async (request, response)=>{
  const films = await imdb(DENZEL_IMDB_ID);
  //console.log(films);
  collection.insertMany(films, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result.result);
  });

});

//workingish....
app.get("/movies", (request,response)=>{
  collection.find({"metascore":{"$gt":70}}).toArray((error,result)=>{
    if(error){
      return response.status(500).send(error);
    }
    var nombre=Math.floor(Math.random()*Math.floor(result.length));
    //console.log(result.length);
    response.send(result[nombre]);
  });
});

app.get("/movies/search", (request,response)=>{
  if(typeof request.query.limit===undefined) limit=5;
  else{
    limit=parseInt(request.query.limit);
    if(isNaN(limit)) limit=5;
  }
  if(typeof request.query.metascore===undefined) metascore=0;
  else{
    metascore=parseInt(request.query.metascore);
    if(isNaN(metascore)) metascore=0;
  }
  console.log(limit);
  console.log(metascore);
  collection.find({"metascore" : {"$gt" : metascore}}).toArray((error,result)=>{
    if(error){
      return response.status(500).send(error);
    }
    var anwser=[];
    for(var i=0;i<limit;i++){
      if(result[i]!=null) anwser.push(result[i]);
    }
    response.send(anwser);
  });
});

//working
app.get("/movies/:id", (request,response)=>{
  collection.findOne({ "id":request.params.id }, (error,result) => {
    if(error){
      return response.status(500).send(error);
    }
    response.send(result);
  });
});



app.get('/show/:name/:id/', function(req, res) {
  console.log(typeof req.query.surname);
    res.json({
        name: req.params.name,
        surname: req.query.surname,
        address: req.query.address,
        id: req.params.id,
        phone: req.query.phone
    });
});
