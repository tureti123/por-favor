import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongodb from 'mongodb';
import path from 'path'
import { readdir } from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv'
dotenv.config()
const { MongoClient } = mongodb;

let count=0
let user = {};
let winner
let identityup=['imposteur','serpentin','superhero','doubleface','roméo','droide']
let decouvert0=0
let decouvert1=0
global.T1 = []
global.T0 = []

 

let mace = '';
let lunch = false;


// Obtenir le répertoire du fichier courant
const __dirname = dirname(fileURLToPath(import.meta.url));

// Créer une instance de l'application Express
const app = express();

// Créer un serveur HTTP basé sur l'application Express
const server = createServer(app);

// Initialiser Socket.io pour le serveur HTTP
const io = new Server(server);

// Servir les fichiers statiques de l'application (y compris index.html)
app.use(express.static(path.join(__dirname)));
app.use('/ordre', express.static(path.join(__dirname, '/ordre')));

// Définir une route pour servir la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/fin.html");  
});

let collec = '';
const url = 'mongodb+srv://tureti:db7dm8mf@cluster0.tvkiecu.mongodb.net/votreBaseDeDonnées?retryWrites=true&w=majority';

async function connectWithMongoClient() {
    const client = new MongoClient(url);
    await client.connect();
    const database = client.db('votreBaseDeDonnées');
    collec = database.collection('user');
}

io.on('connection', (socket) => {
    connectWithMongoClient();
    socket.point=0
    socket.imparti=0
    socket.IDroide=''
    socket.decouvert=0

    socket.on('disconnect', () => {});

    socket.on("disconnecting", () => {
        if (collec !== null && collec !== undefined) {
            disconnecting(socket);
        }
    });

    socket.on('pseudo', async (n) => {
      
        socket.pseudo = n;
      //  user[socket.id] = n;
       
           if (lunch === true) {
           soitajour(socket)
           reco(socket,n);
           
        }
                 
        else{
         
            await mongouser(n)
            soitajour(socket)

        }
       infosave(socket.pseudo,'id',socket.id);
        
        
        
    });

    /*socket.on('ve', () => {
        let ndpe = Object.keys(user).length;
        socket.emit('val', ndpe < 10);
    });*/

    socket.on('t12', async (h,reco) => {
       
        let mace = await collec.countDocuments({ 'team':`T${h}` });
//modifiable mace< 5 ||reco==="reco"
        if (mace< 5 ||reco==="reco") {
            t12(socket, h);
        }
        infosave(socket.pseudo, 'team', `T${h}`);
    });

    socket.on('vt',async (four,reco) => {
        let roomSize = await collec.countDocuments({ 'team':`T${four}` });
       
//modifiable roomSize<5 || reco==="reco"
        if (roomSize<5 || reco==="reco"){
            socket.emit('val2', true);
        }
        else{
            socket.emit('val2', false);
        }
       
    });

    socket.on('nb',async () => {
        let T1 = await collec.countDocuments({ 'team':`T1` });
        let T0 = await collec.countDocuments({ 'team':`T0` });
        //modifiable T1 === 5 && T0===5
        if (T1 === 5 && T0===5) {
            socket.emit('enough', true);
        }
    });

    socket.on('qt', (t, nplace, su,th) => {
        if (t === 'T1') {
            infosave(socket.pseudo,'team',`T1`)
            //infodel(socket.pseudo,'team')
          
        } else {
            infosave(socket.pseudo,'team',`T0`)
            //infodel(socket.pseudo,'team')
        }
        infosave(socket.pseudo, 'teamate', nplace);
        infosave(socket.pseudo, 'supprimer', su);
        infosave("biencommun1", 't', th+1);
    });

    socket.on('saveteamate', (l, s) => {
        infosave(socket.pseudo, 'teamate', `t${l}${s}`);
        infosave(socket.pseudo, 'supprimer', `teamate${l}${s}`);
     
        infosave('biencommun1', 't', s + 1);
        infosave('biencommun0', 't', s + 1);
    });

    socket.on('recup', () => {
        pecor(socket);
    });

    socket.on('conn', (h) => {
        
        connt(socket,h);
        
    });

    socket.on('giverole',async (t) => {

        lunch = t;
        ;//['imposteur'] 
        //pour les deux teams
        for (let b = 0; b < 2; b++) {
            let identity = ['doubleface','droide','serpentin', 'romeo','superhero' ];
            let ni = ['imposteur']
            let k = 0;
            //modifiable
            for(let m=0;m<4;m++) {
                let choix = Math.floor((Math.random() * identity.length)-0,1);
                let nv = identity.splice(choix, 1);
                ni.push(nv[0]);
            }
            
            global[`T${b}`]=await collec.find({'team':`T${b}`}).toArray()
            let idt=global[`T${b}`].map(dpc=>dpc.id)
           
            for (const userid in idt){
                infosaveid(idt[userid], 'role', ni[k]);
                infosaveid(idt[userid],'point',0)
                infosaveid(idt[userid],'ordre',[])
                infosaveid(idt[userid],'position',userid)
                if(ni[k]==='imposteur'){
                    infosaveid(idt[userid],'decouvert',0)
                }
               
                //modifiable
                if (k !== 5 && idt[userid] !== socket.id) {
                    socket.to(idt[userid]).emit('message', ni[k],b);
                    socket.to(idt[userid]).emit(ni[k])
                    
                }
                 else {
                    socket.emit('message', ni[k],b);
                    socket.emit(ni[k])
                }
                //global[ni[k]].add(userid);
                
                k++;
            };
        }
        
    });

    

    socket.on('racket', (f, a1, a2, a3, a4, a5, a6, a7) => {
        io.emit('falldo', f, a1, a2, a3, a4, a5, a6, a7);
    });

    socket.on('resolue', (h, opt, opt2, t) => {
        socket.emit('cfait', h, t);
        infosave('biencommun1', 'table', opt);
        infosave('biencommun0', 'table', opt2);
    });

    socket.on('disconnecting2', (l1, l0) => {
        infosave('biencommun1', 'table', l1);
        infosave('biencommun0', 'table', l0);
       
        io.emit('maj', l1, l0);
    });

    socket.on('failure', () => {
        disconnecting(socket);
    });

    socket.on('omaewa', (v1, v2, v3, v4) => {});

    socket.on('biencommun', (un, zero) => {
        infosave("biencommun1",'table', un);
        infosave( "biencommun0",'table', zero);
        socket.emit('artemis', true);
    });

    socket.on('bjr', (t,x) => {
        console.log(t+'ou est le messsage')
        console.log(x)
    });

    socket.on('jt',async(h)=>{
    
        socket.emit('gh',global[`T${h}`])
    })

    socket.on("elu",async(p,id,h)=>{
     
        let attribution= await collec.findOne({ id:global[`T${h}`][p].id});

        
        if (attribution.role===identityup[id]){
            inc(socket.pseudo,1)
            if(socket.pseudo!==attribution.pseudo){

                if(attribution.role==='imposteur'){

                    await collec.updateOne(
                        { pseudo: attribution.pseudo },  // Remplacez par le critère de recherche (par ex. un ObjectId ou un autre identifiant unique)
                        { $inc: { decouvert: 1 } } 
                
                )
                    
                    
                }
                else {
            
                    inc(attribution.pseudo,-0.5)
                }
           
            }
        }
        else{
         
            inc(socket.pseudo,-1)
           
            if(attribution.pseudo!==socket.pseudo){
            
                inc(attribution.pseudo,0.5)
            } 
        }
        count++
       
        if(count===8){
           let calmar=await collec.find({decouvert:{$exists:true}}).toArray()
           let kraken=await collec.find({camp:{$exists:true}}).toArray()
           await new Promise(async(resolve)=> {
                for (const poulpe of calmar) {
              
                if(poulpe.decouvert<=1){
                  
                    await inc(poulpe.pseudo,2-(0.5*Number(poulpe.decouvert)))
               
                   }

                   else{
                    await inc(poulpe.pseudo,-Number(poulpe.decouvert))
                   
                   }
                
               };
    
                for (const poulpe of kraken) {
              
                if(poulpe.team===winner && poulpe.camp==='win'){
                
                    await inc(poulpe.pseudo,1)
                
                   }
                   else if(poulpe.camp==='lose') {
                    await inc(poulpe.pseudo,1)
                   }
                
               };
               resolve()
           })
        
         .then(async()=>{

            let chacal =await collec.find({point:{$exists:true}}).sort({point:-1}).toArray()
            
            io.emit('resultat',chacal)
         })

        }
        
    })
    socket.on('delu',async(opt,opt1,h)=>{
       
        let chasseur=await collec.findOne({ role:'serpentin',team:`T${h}`});
        let hero=await collec.findOne({ role:'superhero',team:`T${h}`});
   
       if (chasseur!==null && chasseur!==undefined){
        if (chasseur.pseudo===opt1){

            inc(chasseur.pseudo,1)

        }}
        if(hero!==null && hero!==undefined){

        
        if (hero.pseudo===opt){
 
            inc(hero.pseudo,1)
        }}
    })

    socket.on('savetab',(disco,t)=>{
        infosave(socket.pseudo,disco,t)
    })

    socket.on('clear',async()=>{
        
        await collec.deleteMany({});
        T1.length=0
        T0.length=0
        
    })
    socket.on('bard',(shop)=>{
        droideaudio(shop,socket)
        
    })
    socket.on('sendall', async() => {
        mongouser('crap')
        await infosave('crap','function','testinglimit')
        chrono(0,socket)
       
    });
    socket.on('sendall2',async()=>{
        clearTimeout(socket.trynda);
    })

  /*  socket.on('gros',()=>{
        console.log('gros')
        chrono(0,socket)
    })*/
   socket.on('arretmission',()=>{})
   socket.on('gagnant',async()=>{
    
    let sakor = await collec.findOne({ pseudo: socket.pseudo });
  
    let kakor = await collec.find({ 'team':sakor.team}).toArray();
   winner=sakor.team
    kakor.forEach(element => {
       
        socket.gagnant=element.point+1
        infosave(element.pseudo,'point',socket.gagnant)
    });
   })
})

async function testons() {
    let testing = await collec.findOne({ skip: 'trahison' });
    return testing;
}

async function pecor(socket) {
    let pecor = await collec.findOne({ pseudo: socket.pseudo });
    let mecor = await collec.findOne({ pseudo: 'biencommun1' });

    if (pecor.teamate !== undefined) {
        socket.emit('recap', pecor.teamate, pecor.supprimer, mecor.t);
    }
}

async function infosave(pseudo, prop, info) {
    if (collec ) {
        await collec.updateOne({ pseudo: pseudo }, { $set: { [prop]: info } });
    }
}
async function infosaveid(id, prop, info) {
    if (collec ) {
        await collec.updateOne({ id: id }, { $set: { [prop]: info } });
    }
}


async function mongouser(pseudo) {
    let us = { pseudo: pseudo };
    await collec.insertOne(us);
}



async function reco(socket, n) {
  
    let decor = await collec.findOne({ pseudo: n });
  
        if (decor!==null){
    if (decor.role !== undefined ) {
        socket.emit(decor.role,decor.ordre);
    }
    if (decor.team !== undefined ) {
       
        socket.emit(decor.team)
        global[decor.team][decor.position]=decor
      
    }
    if(decor.disco!==undefined){

        socket.emit('avance',decor.disco,'dab')
        socket.emit('avance',decor.macro,'parametre')
        socket.emit('avance',decor.validation,'validation')

    }// faut que je differncie quand c double face et quand c droide
    if (decor.lapin!==undefined){
        socket.emit('lelouch',decor.lapi,'listordre')
    let tempsrestant=decor.tn-decor.temps
    
        globalThis[decor.role]([decor],socket,0,tempsrestant,decor.ordre[-1],false)
    }
}
}

async function disconnecting(socket) {
    let supragrand = await collec.findOne({ pseudo: socket.pseudo });
//s'il y a quelque chose il supprime
    if (supragrand !== null) {
        if (supragrand.team !== undefined ) {
            delete global[supragrand.team][supragrand.position]
            
           // global[supragrand.team].delete(socket.pseudo);
           if (lunch===false){
         delete supragrand.team
           
        }
    }

        if (supragrand.role !== undefined && supragrand.role !== null) {
           // global[supragrand.role].delete(socket.pseudo);
           if(lunch===false){
            delete supragrand.role
           }
        } 
        else {
            //quand on se deconnecte je supprime ton profil
            await collec.deleteOne({ pseudo: socket.pseudo });
        }
        //ne remet plus jamais en doute artemis ce ne bloquera jamais 
        await new Promise((resolve) => {
            socket.on('artemis', (t) => {
                resolve(t);
            });
        });
    }
    
    socket.emit('stomp',false)
  
    clearTimeout(socket.IDroide)
    infosave(socket.pseudo,'temps',socket.imparti)
       /* await new Promise((resolve)=>{
            socket.on('tictac',(p)=>{
                console.log('dksfqjslkdfjsdqlkfsjlk')
                resolve(p)
            })
        })*/
       
}

async function connt(socket,h) {
   
    let team= await collec.findOne({pseudo:socket.pseudo})

    
   //deja dans une equipe
    if (team!==null && team.team!==undefined) {
       
        socket.emit('cringe', true, socket.pseudo);
    }
    //trouve pas de team 
    else {
       
        socket.emit('cringe', false, socket.pseudo);
    }
   
}

async function soitajour(socket) {  
   
    let cecor = await collec.findOne({ pseudo: 'biencommun1' });
    let secor = await collec.findOne({ pseudo: 'biencommun0' });
    

    if (cecor !== undefined || secor !== undefined) {
        if (cecor !== null || secor !== null) {
            socket.emit('maj', cecor.table, secor.table);
        } 
        else {
        
            mongouser('biencommun0');
            await mongouser('biencommun1');  
           await infosave('biencommun1', 't', 0);
        }
    }
}

async function t12(socket, h) {
    let pog = await collec.findOne({ pseudo: `biencommun${h}` });
    if (collec.findOne({pseudo:socket.pseudo})!==null && pog!==null){
    socket.emit('rej', socket.pseudo, pog.t);
    infosave(socket.pseudo, 'team', `T${h}`);
   // global[mace].add(socket.pseudo);
    }
}
hoho()
async function hoho(){
    const readdirAsync = promisify(readdir);
    const files=await readdirAsync('\ordre')
    tabaudio0=files.slice()
    tabaudio1=files.slice()
  

}

global.tabaudio0 = '';
global.tabaudio1 = '';
let doublefuck=['tu dois gagner','tu dois perdre']

global.IDroide0=''
global.IDroide1=''
let stop=true
let mv=''
global.Idouble0=''
global.Idouble1=''


globalThis.doubleface=async function doubleface(facy,socket,k,tr,ordre){
  
    if(socket.pseudo!==facy[k].pseudo){
      
        socket.to(facy[k].id).emit('stomp',true)
        }
        else{
            
            socket.emit('stomp',true)
        }

        
    if (stop===true){
   
     if (tr!==0){
    
        socket.emit('gros')
        infosave(facy[k].pseudo,'tn',tr)
        await setTimeout(()=>{
            doubleface(facy,socket,k,0,ordre,false)}, tr);
        
     }
       else{ 
        if(ordre===null || ordre===undefined){
            var timer2=await (Math.floor((Math.random() * 4.99))+1)*10000
               
                let choisi = Math.floor(Math.random() * (doublefuck.length)-0,1);
            
                mv = doublefuck[choisi];
            
             
                
            
       
        infosave(facy[k].pseudo,'tn',timer2)
        collec.updateOne({pseudo:facy[k].pseudo}, {$push: { ordre: mv} });
        }
        
        else {
          
            mv=ordre
            
        }
    }
        
        if (facy[k].pseudo!==socket.pseudo){
        
        socket.to(facy[k].id).emit('mele',mv.toString(),Number(timer2))
        socket.to(facy[k].id).emit('gros')
        
        
        }
        else{
            socket.emit('mele',mv.toString(),Number(timer2))
            socket.emit('gros')
           
        }
    } 
    if (mv==='tu dois gagner'){
        infosave(facy.pseudo,'camp','win')
    }
    else{
        infosave(facy.pseudo,'camp','lose')
    }
        global[`Idouble${k}`]=setTimeout(()=>doubleface(facy,socket,k,0,null),timer2);
    }
    
globalThis.droide=async function droide(lebadre,socket,k,tr,ordre,first){
   
    //arrete le chronometre quand sotp false cad quand on appuie sur arreter 
    //quand le mec re rentre avec
    if(socket.pseudo!==lebadre[k].pseudo){
       
        socket.to(lebadre[k].id).emit('stomp',true)
        }
        else{
        
            socket.emit('stomp',true)
        }

        
    if (stop===true){
   
     if (tr!==0){
     
        socket.emit('gros')
        infosave(lebadre[k].pseudo,'tn',tr)
        await setTimeout(()=>{
            droide(lebadre,socket,k,0,ordre,false)}, tr);
        
     }
       else{ 
        if(ordre===null || ordre===undefined){
            var timer=await (Math.floor((Math.random() * 4.99))+1)*10000
         
            if (first===false){
                mv='pick un champion aleatoire.mp3'
                while(mv==='pick un champion aleatoire.mp3' || mv==='tu dois gagner.mp3' || mv==='tu dois perdre.mp3'){
              
                let choisi = Math.floor(Math.random() * (global[`tabaudio${k}`].length)-0,1);
               
                mv = global[`tabaudio${k}`].splice(choisi, 1).toString();
              
                }
            }
       
        else{
         
           mv='pick un champion aleatoire'
        }

        infosave(lebadre[k].pseudo,'tn',timer)
        collec.updateOne({pseudo:lebadre[k].pseudo}, {$push: { ordre: mv} });

        } 
        else {
           
            mv=ordre
            
        }
        
        if (lebadre[k].pseudo!==socket.pseudo){
    
        socket.to(lebadre[k].id).emit('mele',mv.toString())
        socket.to(lebadre[k].id).emit('gros')
        
        
        }
        else{
            socket.emit('mele',mv.toString())
            socket.emit('gros')
           
        }
        global[`IDroide${k}`]=setTimeout(()=>{
            droide(lebadre,socket,k,0,null,false)
        console.log('prochaine ordre')}, timer);

    } 
}

}

async function droideaudio(shop,socket) {
   

    if(shop===false){
        stop=false
        clearTimeout(IDroide0)
        clearTimeout(IDroide1)
        clearTimeout(Idouble0)
        clearTimeout(Idouble1)

      
      


    }
    else{
        let lebadre=await collec.find({'role':'droide'}).toArray()
        let facy=await collec.find({'role':'doubleface'}).toArray()
        let romeo=await collec.find({'role':'romeo'}).toArray()
   
 //execution immediat
 


 if(facy!==null && facy!==undefined && facy.length!==0 ){
    if(facy[1]!==undefined){
        doubleface(facy,socket,1,0,null)
    }
   if(facy[0]!==undefined){
    doubleface(facy,socket,0,0,null)
   }
 }

if(lebadre!==null && lebadre!==undefined&&lebadre.length!==0){



    for(let k=0;k<2;k++){
        if( lebadre[k]!==undefined){
        let pf=Math.floor((Math.random() * 1.99))
        let yuk=[true,false]
        
        if(yuk[pf]===true){
            droide(lebadre,socket,k,0,null,yuk[pf])
        }
        else{
            let  timer=await (Math.floor((Math.random() * 4.99))+1)*10000
            setTimeout(()=> droide(lebadre,socket,k,0,null,yuk[pf]),timer)
        }
       
    }}
}
 

 if(romeo!==null && romeo!==undefined && romeo.length!==0 ){
    for(let k=0;k<2;k++){
        if (romeo[k]!==undefined){
       
        if(romeo[k].team==='T1'){
            let juliette=await collec.find({'team':'T0'}).toArray()
           
            let jul=Math.floor(Math.random() * 1.99)
            
            let niquetarace=juliette[jul].pseudo
            if(socket.pseudo!==romeo[k].pseudo){
              
                socket.to(romeo[k].id).emit('mele',`voici ta juliette ${niquetarace} j'espère que tu heureux que ce soit cette personne`,false,true)
                }    
        
            else{
                socket.emit('mele',`voici ta juliette ${niquetarace} j'espère que tu heureux que ce soit cette personne`,false,true)
            }
    }
        else if(romeo[k].team==='T0'){
            let juliette=await collec.find({'team':'T1'}).toArray()
            let jul=Math.floor(Math.random() * 1.99)
            let niquetarace=juliette[jul].pseudo
            if(romeo[k].pseudo!==socket.pseudo){
              
            socket.to(romeo[k].id).emit('mele',`voici ta juliette ${niquetarace} j'espère que tu heureux que ce soit cette personne`,false,true)
            }
            else{
               
                socket.emit('mele',`voici ta juliette ${niquetarace} j'espère que tu heureux que ce soit cette personne`,false,true)
            }
        }
    
    }    
  } 
 }
}
} 

    

async function inc(l,n) {
    await collec.updateOne(
        { pseudo: l },  // Remplacez par le critère de recherche (par ex. un ObjectId ou un autre identifiant unique)
        { $inc: { point: n } } 

)}
globalThis.testinglimit=function testinglimit(){
    console.log('yo connard')
    }
    


const PORT = process.env.PORT ;
server.listen(PORT, () => {});