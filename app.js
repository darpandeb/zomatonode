var express = require('express');
var app = express();
var dotenv = require('dotenv');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
dotenv.config();
var mongoUrl = "mongodb://testuser:SWdqyUIMdVcaK8V0@cluster0-shard-00-00.tu5oi.mongodb.net:27017,cluster0-shard-00-01.tu5oi.mongodb.net:27017,cluster0-shard-00-02.tu5oi.mongodb.net:27017/edureka?ssl=true&replicaSet=atlas-86s3em-shard-0&authSource=admin&retryWrites=true&w=majority";
var cors = require('cors')
const bodyParser = require('body-parser')
var port = process.env.PORT || 8124;
// save the database connection
var db;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// first default route
app.get('/',(req,res) => {
    res.send("Hiii From Express")
})

// return all the city
app.get('/location',(req,res) => {
    db.collection('location').find({},{projection: { _id: 0 }}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// return all the mealType
app.get('/mealType',(req,res) => {
    db.collection('Mealtypes').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

/*
// return all the restaurants
app.get('/restaurants',(req,res) => {
    db.collection('restaurants').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})*/

// restaurant wrt to id
app.get('/restaurant/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('restaurant').find({"restaurant_id":id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// query params example
/// wrt to city_name
app.get('/restaurants',(req,res) => {
    var query = {};
    if(req.query.city){
        query={state_id:Number(req.query.city)}
    }
    db.collection('restaurant').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// restaurant wrt to mealId
app.get('/filter/:mealId',(req,res) => {
    var id = parseInt(req.params.mealId);
    var sort = {cost:1}
    var skip = 0;
    var limit = 1000000000000
    var query = {"mealTypes.mealtype_id":id};
    if(req.query.sortKey){
        var sortKey = req.query.sortKey
        if(sortKey>1 || sortKey<-1 || sortKey==0){
            sortKey=1
        }
        sort = {cost: Number(sortKey)}
    }
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip)
        limit = Number(req.query.limit)
    }

    if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
    }

    if(req.query.cuisine && req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],
                "cuisines.cuisine_id":Number(req.query.cuisine),
                "mealTypes.mealtype_id":id}
    }
    else if(req.query.cuisine){
       query = {"mealTypes.mealtype_id":id,"cuisines.cuisine_id":Number(req.query.cuisine)}
       // query = {"mealTypes.mealtype_id":id,"cuisines.cuisine_id":{$in:[2,5]}}
    }else if(req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id}
    }

    db.collection('restaurant').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// return all the menu
app.get('/menu/:restid',(req,res) => {
    var restid = Number(req.params.restid)
    db.collection('RestuarantMenu').find({restaurant_id:restid}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.post('/menuItem',(req,res) => {
    console.log(req.body);
    db.collection('RestuarantMenu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
    
})

app.put('/updateStatus/:id',(req,res) => {
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending"
    db.collection('order').updateOne(
        {id:id},
        {
            $set:{   
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
    )
    res.send('data updated')
})

// return all the orders
app.get('/orders',(req,res) => {
    db.collection('order').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// return orders based on email 
app.get('/orders',(req,res) => {
    query={}
    if(req.query.email){
        query={email:req.query.email}
        db.collection('order').find(query).toArray((err,result) => {
            if(err) throw err;
            res.send(result)
        })
    }
    
})


app.post('/placeOrder',(req,res) => {
    console.log(req.body);
    db.collection('order').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed")
    })
})

app.delete('/deleteOrders',(req,res)=>{
    db.collection('order').remove({},(err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


// connecting with mongodb
MongoClient.connect(mongoUrl, (err,client) => {
    if(err) console.log("Error While Connecting");
    db = client.db('edureka');
    app.listen(port,()=>{
        console.log(`listening on port ${port}`)
    })
})

