const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const { Webhook } = require('discord-webhook-node');
const Discord = require('discord.js');
const config = require("./config.json");
var http = require('http').Server(app);
var io = require('socket.io')(http);
const reload = require('express-reload')

var user
var userName
var loggato = false;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://Alex:ZicdzhMqwEHtbCT6@cluster0.bzmph.mongodb.net/myFirstDatabase")

const client = new Discord.Client();


let prefix = "!";

const notesSchema ={
  logo: String,
  title: String,
  desc: String,
  link: String,
  devoloper: String,
  approvato: Boolean,
  voti: Number
}

const userSchema = {
  email : String,
  password : String,
  userName : String,
  votato : Boolean
}


const Note = mongoose.model("Videogiochi-non-approvati", notesSchema)

const User = mongoose.model("login", userSchema)

 
app.get('/', (req, res) => {
  Note.find({}, function(err, partiCard) {
    if (loggato === true){
      res.render ("games-login", {user : userName, partiCardList: partiCard})
    }
    else if (loggato === false){
      res.render('games', {
        partiCardList: partiCard
    })
    }
  })
})

app.get("/aggiungi", (req, res) => {
  if (loggato === true){
    res.sendFile (__dirname + "/aggiungi.html")
  }

  else if (loggato === false){
    Note.find({}, function(err, partiCard) {
      res.render ("games", {partiCardList : partiCard})
    })
  }
})

app.post("/aggiungi", function(req, res){
  let newNote = new Note({
    title: req.body.title,
    desc: req.body.desc,
    link: req.body.link,
    logo: req.body.logo,
    devoloper: userName,
    approvato: false,
    voti: 0

  });

  let gioco_id;

  newNote.save(function(err,gioco) {
    gioco_id = gioco.id;
 });

  console.log(gioco_id);
  console.log("Salvato, db aggiornato!")

  const Hook1 = new Webhook("https://discord.com/api/webhooks/857985572220043274/xx4pX7hvFvkri5i6OJJIBLtjhTD95nkExgR95xTf07hwFMPyWZNQ3An_CkyyVGVcJEOa");
 
  var ruolo = "858018579218563092";
  var devoloper;

  var NomeGioco = req.body.title;
  var LinkGioco = req.body.lnik;
  var DevoloperGioco = req.body.devoloper;
  var LogoGioco = req.body.logo;
  var DescGioco = req.body.desc;

  devoloper = DevoloperGioco;

  var msg = `Ehi <@&${ruolo}>, ecco un nuovo gioco da approvare!\nNome: ${NomeGioco}\nDevoloper: <@${devoloper}>`;

  
  console.log("Gioco Inviato con successo")
  Hook1.send(msg);

  const Hook2 = new Webhook("https://discord.com/api/webhooks/858255775248285726/DgZvLIZWxW-kKIctavprvIkY4isMJ4WoBYjtUkpI1JSWrJIXmOy86YSzu-7ak7p5F48S");
  
  var devoloper;

    
  var NomeGioco = req.body.title;
  var LinkGioco = req.body.link;
  var DevoloperGioco = req.body.devoloper;
  var LogoGioco = req.body.logo;
  var DescGioco = req.body.desc;

  devoloper = DevoloperGioco;


  var msg2 = `Nome: ${NomeGioco}\nDevoloper: <@${devoloper}>\nDescrizione: ${NomeGioco}\nID: ${gioco_id}\n Link: ${LinkGioco}`;


  console.log("Gioco Inviato con successo anche in privato agli staffer")

  //Hook2.send(msg2);
  //Hook2.send(infogioco)

  client.channels.cache.get(`858254918065455104`).send(msg2)
  res.render("aggiungi")
})


app.get("/index", (req, res) => {
  Note.find({}, function(err, partiCard) {
    if (loggato === true){
      res.render ("games-login", {user : userName, partiCardList: partiCard})
    }
    else if (loggato === false){
      res.render('games', {
        partiCardList: partiCard
    })
    }
  })
})


app.get("/aggiungi", function(req, res){
  res.sendFile(__dirname + "/aggiungi.html")
})

app.get("/games", (req, res) => {
  Note.find({}, function(err, partiCard) {
    if (loggato === true){
      res.render ("games-login", {user : userName, partiCardList: partiCard})
    }
    else if (loggato === false){
      res.render('games', {
        partiCardList: partiCard
    })
    }
  })
})

//Register

app.get("/Register", (req, res) =>{
  res.render ("register")
})

app.post("/Register", function (req, res)  {

  var mailCheck = req.body.email
  var UserNameCheck = req.body.Username


  let register = new User({
    email :  req.body.email,
    password : req.body.password,
    userName : req.body.Username,
    votato : false
  })

  User.exists({ userName: `${req.body.Username}` }, function(err, result) {
    if (err) {
      res.send("Abbio riscontrato un errore");
    } else {

      console.log (result)


       
      User.exists({ email: `${req.body.email}` }, function(err, result) {
          if (err) {
            res.send("Abbio riscontrato un errore");
          }
          else{
            if (result === false){
              res.render ("login")
              register.save()
            }

            else if (result === true){
              //res.alert("La mail o il nome dell'utente sono già state utilizzate")
              res.render ("register2", {accountCreato : false})
            }
          }
        })
      
    }
  })
})

//Login

app.get("/login", async (req, res) => {
  res.render("login")

})

app.post ("/login", (req, res) => {

  var password

  userName = req.body.user
  password = req.body.password

  User.exists({ userName: `${req.body.user}`, password:  `${req.body.password}` }, function(err, result) {
    if (err){
      res.send ("Abbiamo riscontrato un errore")
    }
    else if (result === true){
      loggato = true;
      Note.find({}, function(err, partiCard) {
        res.render ("games-login", {user : req.body.user, partiCardList: partiCard})
      })
    }
    else if (result === false){
      res.render ("login2")
    }
  })
  
})

//Logout 

app.get("/logout", (req, res) =>{
  loggato = false
  Note.find({}, function(err, partiCard) {
    res.render('games', {
        partiCardList: partiCard
    })
    
  })
})

//User

app.get("/user", (req, res) => {
  Note.find({}, function(err, partiCard) {
    if (loggato === true){
      res.render ("userProfile", 
      {user : userName, partiCardList: partiCard})
    }
    else if (loggato === false){
      res.render('games', {
        partiCardList: partiCard
    })
    }
  })
})

client.on('message', message => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if (message.author.id === "850357951452676106") {
    if (command === 'approva') {
      if (!args.length) {
        return message.channel.send(`Scrivi l'id del videogioco, ${message.author}!`);
      }
          
          Note.findOneAndUpdate({_id: args}, {"approvato": true},  function(err,data)
          {
              if(!err){
                  var nome
                  message.channel.send("Il gioco è stato approvato correttamente!")
    
                  Note.findById({_id : args}, (error, data) =>{
                      titolo = data.title
                      descrizione = data.desc
                      link = data.link
                      devoloper = data.devoloper
                      logo = data.logo
                  })
    
                  Update()
              }
    
              else{
                  message.channel.send("E' stato riscontrato un errore, prova a veder se l id era corretto!")
              }
          
          });
    
    }

    else if (command === 'rifiuta') {
      if (!args.length) {
        return message.channel.send(`Scrivi l'id del videogioco, ${message.author}!`);
      }
    
          Note.findOneAndRemove({_id: args},  function(err,data)
          {
              if(!err){
                 message.channel.send("Il gioco è stato eliminato correttamente!")
              }
    
              else{
                  message.channel.send("E' stato riscontrato un errore, prova a veder se l id era corretto!")
              }
          
          });
    
    
      }
  }

  else if (message.author.id != "838302280548614184"){
    message.channel.send("Non puoi farlo!")
  }
});

//Sito giochi
function Update(){
  Note.find({}, function(err, partiCard) {
    var voti = 0
    
    partiCard.forEach (partiCard2 =>{
      app.get(`/${partiCard2._id}`, (req, res) =>{
        if (loggato === false){
          Note.find({}, function(err, updateMongoose) {
            updateMongoose.forEach (updateMongoose2 => {
              res.render("infoGioco", 
              {nome : partiCard2.title, devoloper : partiCard2.devoloper,
              img : partiCard2.logo, link : partiCard2.link, 
              desc : updateMongoose2.desc, 
              voti : updateMongoose2.voti })
              console.log (partiCard2.voti)
            })
          })
          
        }
        else if (loggato === true){
          Note.find({}, function(err, updateMongoose) {
            updateMongoose.forEach (updateMongoose2 => {
              res.render ("infoGioco-loggato", 
              {nome : partiCard2.title, devoloper : partiCard2.devoloper,
              img : partiCard2.logo, link : partiCard2.link, 
              desc : updateMongoose2.desc, user : userName,
              voti : updateMongoose2.voti, id : partiCard2._id })
            })
          })

        }     
      })
    })
   
     //Voto
     partiCard.forEach(partiCard2 =>{
      console.log (partiCard2.voti)
      app.get(`/${partiCard2._id}/vota`, ( req, res ) =>{
          var voti = 0
          if (loggato === false) {
            Note.find({}, function(err, updateMongoose) {
              updateMongoose.forEach (updateMongoose2 => {
                res.render("infoGioco", 
                {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                img : partiCard2.logo, link : partiCard2.link, 
                desc : partiCard2.desc, 
                voti : updateMongoose2.voti })
                console.log (partiCard2.voti)
              })
            })
          }
          else if (loggato === true){
            //Fare il + uno con Note.findOne ({})
          
            User.find ({}, function(err, partiUser){

              partiUser.forEach(partiUser2 =>{
                if (partiUser2.userName === userName){
                  console.log("Sei tu")
                  if (partiUser2.votato === false){
                    Note.find({}, function(err, updateMongoose) {
                      updateMongoose.forEach (updateMongoose2 => {
                        client.channels.cache.get(`858254916027285524`).send(`**${partiCard2.title}** è stato votato da **${userName}**! Ora ha **${updateMongoose2.voti + 1}** voti!`)
                        Note.findOneAndUpdate({_id: updateMongoose2._id}, {"voti" : updateMongoose2.voti + 1 },  function(err,data){
                          console.log (data.voti)
                          res.render ("infoGioco-loggato", 
                            {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                            img : partiCard2.logo, link : partiCard2.link, 
                            desc : partiCard2.desc, user : userName,
                            voti : updateMongoose2.voti + 1, id : partiCard2._id })
    
                        })
                        User.findOneAndUpdate({userName: userName}, {"votato": true},  function(err,data){
                          console.log("Non puoi più votare")
                        })
                      })
                    })

                   
                  }
      
                  else if (partiUser2.votato === true){
                    Note.find({}, function(err, updateMongoose) {
                      updateMongoose.forEach (updateMongoose2 => {
                        res.render ("infoGioco-loggato2", 
                        {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                        img : partiCard2.logo, link : partiCard2.link, 
                        desc : partiCard2.desc, user : userName,
                        voti : updateMongoose2.voti, id : partiCard2._id })
                      })
                    })
                    
                  }
                }
                else if(partiUser2.userName != user){
                  console.log("Non sei tu")
                }
                
              })     
            })
                   
          }
      })
  })

    //Elimina
    partiCard.forEach(partiCard2 =>{
          app.get(`/${partiCard2._id}/elimina`, ( req, res ) =>{
            if (partiCard2.devoloper === userName){
              Note.findOneAndRemove({title: partiCard2.title },  function(err,data){
                Note.find({}, function(err, partiCard) {
                  if (loggato === true){
                    res.render ("userProfile", 
                    {user : userName, partiCardList: partiCard})
                  }
                  else if (loggato === false){
                    res.render('games', {
                      partiCardList: partiCard
                  })
                  }
                })
              })
            }
  
            else if (partiCard.devoloper != userName){
              Note.find({}, function(err, partiCard) {
                if (loggato === true){
                  res.render ("userProfile", 
                  {user : userName, partiCardList: partiCard})
                }
                else if (loggato === false){
                  res.render('games', {
                    partiCardList: partiCard
                })
                }
              })
            }
          })
        })

        //Modifica
      partiCard.forEach(partiCard2 =>{
        console.log (partiCard2.voti)
        app.get(`/${partiCard2._id}/modifica`, ( req, res ) =>{
            var voti = 0
            if (loggato === false) {
              Note.find({}, function(err, updateMongoose) {
                updateMongoose.forEach (updateMongoose2 => {
                  res.render("infoGioco", 
                  {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                  img : partiCard2.logo, link : partiCard2.link, 
                  desc : partiCard2.desc, 
                  voti : updateMongoose2.voti })
                  console.log (partiCard2.voti)
                })
              })
            }
            else if (loggato === true){
              Note.find({}, function(err, updateMongoose) {
                updateMongoose.forEach (updateMongoose2 => {
                  res.render ("update",
                  { id : updateMongoose2._id

                  })
                  
                })
              })
            }
        })
      })

      partiCard.forEach(partiCard2 =>{
        console.log (partiCard2.voti)
        app.post(`/${partiCard2._id}/modifica`, ( req, res ) =>{
            var voti = 0
            if (loggato === false) {
              Note.find({}, function(err, updateMongoose) {
                updateMongoose.forEach (updateMongoose2 => {
                  res.render("infoGioco", 
                  {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                  img : partiCard2.logo, link : partiCard2.link, 
                  desc : partiCard2.desc, 
                  voti : updateMongoose2.voti })
                  console.log (partiCard2.voti)
                })
              })
            }
            else if (loggato === true){
              Note.find({}, function(err, updateMongoose) {
                updateMongoose.forEach (updateMongoose2 => {
                  res.render ("update",
                  { id : updateMongoose2._id

                  })
                  var updateDesc = req.body.desc
                  client.channels.cache.get(`857985378040152064`).send(`**${partiCard2.title}** è stato modificato da **${userName}**!`)
                  Note.findOneAndUpdate({_id: updateMongoose2._id}, {"desc" : req.body.desc},  function(err,data){
                    console.log (data.voti)
                    res.render ("infoGioco-loggato", 
                      {nome : partiCard2.title, devoloper : partiCard2.devoloper,
                      img : partiCard2.logo, link : partiCard2.link, 
                      desc : req.body.desc, user : userName,
                      voti : updateMongoose2.voti, id : partiCard2._id })

                  })  
                })
              })
            }
        })
      })
  
      }) 

    
}

//Socket IO
io.on('connection', () =>{
  console.log('a user is connected')
})


//Server
var server = http.listen(process.env.PORT || 4000, () => {
  console.log('server is running on port', server.address().port);


  Update()
 
});


//Bot
client.login (config.token);


/*COSE MANCANTI:
 => modifica videogioco (poco importante sarà disponibile più avanti)
 => fixare il voto non fa update in tempo reale perchè non uso web socket, questo è un problema
*/