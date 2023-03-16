const { MongoClient, Compressor } = require("mongodb");
const express = require("express");
let app = express();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
var bodyparser = require("body-parser");
const cors = require("cors");
const { json } = require("body-parser");
const { response } = require("express");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// Create Instance of MongoClient for mongodb
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const client = new MongoClient("mongodb://localhost:27017/Btup");
let data;
// Connect to database
client.connect();
client
  .db("Btup")
  .collection("Coursedata")
  .find()
  .toArray()
  .then((res) => {
    data = res;
  
  });
app.post("/cd", (req, res) => {
  res.send(data);
});
let sc = [];
app.post("/selection", (req, res) => {
  sc = req.body;
  console.log(sc);
  getpaper(sc);
});


let links;
let filename;
let getpaper = () => {
  client
    .db("Btup")
    .collection("PaperInfo")
    .find({
      Course: { $in: [sc[0]] },
      Stream: { $in: [sc[1]] },
      Semester: { $in: [sc[2]] },
    })
    .project({ Filename: 1, Subject: 1,Year:1, })
    .toArray()
    .then((res) => {
     
      links = res
      
      app.post("/links", (req, res) => {
        res.send(JSON.stringify(links));
      });
   let filename=links.map(obj=>obj.Filename);
   console.log(filename)
    });
};

app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', fileName);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});















app.post('/input-data', upload.single('file'), (req, res) => {
  // handle file upload and other form data
  const formData = req.body;
  const file = req.file;
formData.Filename=file.originalname;
client.db("Btup").collection("PaperInfo").insertOne(formData);
  // save the file to a folder using fs module
  const fs = require('fs');
  fs.renameSync(file.path, 'uploads/' + file.originalname);

  // send a response
  res.json({ message: 'File uploaded successfully' });
});

let username;
let password;
app.post('/credential',(req,res)=>{
     
      username=req.body[0];
      password=req.body[1];
     
    
      let collection =client.db("Btup").collection("admin")
     
      collection.find({username:`${username}`,pswd:`${password}`}).toArray().then((response)=>{
        console.log(response)
      console.log(response.length!==0)
        if(response.length!==0){
          res.status(200).send("valid login")
          console.log(response)
        }
        else{
          res.status(400).send("invalid attemp")
          
        }
      })
    
})


//sending responce




  // client
  // .db("Btup")
  // .collection("")
  // .find()
  // .toArray()
  // .then((res) => {
  //   data = res;
  
  // });









  app.listen(5000, () => {
    console.log("app listning at port 5000");
  });
  