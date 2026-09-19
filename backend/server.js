const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

const seed = { gigs: [], bookings: [] };

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
      return { gigs: [], bookings: [] };
    }
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return { gigs: Array.isArray(db.gigs) ? db.gigs : [], bookings: Array.isArray(db.bookings) ? db.bookings : [] };
  } catch (_) { return { gigs: [], bookings: [] }; }
}
let db = loadDB();
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const clean = (v, n=500) => String(v ?? '').trim().slice(0,n);
const makeId = p => p + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);

app.get('/api/health', (_,res) => res.json({ok:true, service:'SkillSwap backend'}));

app.get('/api/gigs', (req,res) => {
  let list=[...db.gigs], q=clean(req.query.q,100).toLowerCase(), category=clean(req.query.category,50);
  if(q) list=list.filter(g => (g.title+' '+g.category+' '+g.description+' '+g.creator+' '+(g.tags||[]).join(' ')).toLowerCase().includes(q));
  if(category) list=list.filter(g=>g.category===category);
  res.json(list);
});

app.post('/api/gigs', (req,res) => {
  const title=clean(req.body.title,120), category=clean(req.body.category,50), creator=clean(req.body.creator,100), description=clean(req.body.description,1000), rate=Number(req.body.rate);
  if(!title||!category||!creator||!description||!Number.isFinite(rate)||rate<0) return res.status(400).json({error:'Invalid gig data.'});
  const gig={id:makeId('gig'),title,category,creator,description,rate,rating:0,reviews:0,tags:Array.isArray(req.body.tags)?req.body.tags.slice(0,10):[],createdAt:new Date().toISOString()};
  db.gigs.unshift(gig); saveDB(); res.status(201).json(gig);
});

app.get('/api/bookings',(req,res)=>{
  let list=[...db.bookings], creator=clean(req.query.creator,100), client=clean(req.query.client,100);
  if(creator) list=list.filter(b=>b.creator===creator);
  if(client) list=list.filter(b=>b.clientName===client);
  res.json(list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
});

app.post('/api/bookings',(req,res)=>{
  const gigId=clean(req.body.gigId,100), clientName=clean(req.body.clientName,100), requirement=clean(req.body.requirement,2000), deadline=clean(req.body.deadline,50);
  if(!gigId||!clientName||!requirement||!deadline) return res.status(400).json({error:'gigId, clientName, requirement and deadline are required.'});
  const gig=db.gigs.find(g=>g.id===gigId);
  if(!gig) return res.status(404).json({error:'Gig not found.'});
  const active=db.bookings.find(b=>b.gigId===gigId&&(b.status==='Pending'||b.status==='Accepted'));
  if(active) return res.status(409).json({error:'This gig already has a pending or accepted booking.',booking:active});
  const now=new Date().toISOString();
  const booking={id:makeId('booking'),gigId,gigTitle:gig.title,creator:gig.creator,rate:gig.rate,clientName,requirement,deadline,status:'Pending',createdAt:now,updatedAt:now};
  db.bookings.unshift(booking); saveDB(); res.status(201).json({message:'Booking confirmed and sent to the creator.',booking});
});

app.patch('/api/bookings/:id/status',(req,res)=>{
  const booking=db.bookings.find(b=>b.id===req.params.id);
  if(!booking) return res.status(404).json({error:'Booking not found.'});
  const status=clean(req.body.status,20);
  if(!['Accepted','Declined'].includes(status)) return res.status(400).json({error:'Status must be Accepted or Declined.'});
  booking.status=status; booking.updatedAt=new Date().toISOString();
  if(status==='Accepted') db.bookings.forEach(b=>{if(b.id!==booking.id&&b.gigId===booking.gigId&&b.status==='Pending'){b.status='Declined';b.updatedAt=new Date().toISOString();}});
  saveDB(); res.json({message:'Booking '+status.toLowerCase()+'.',booking});
});

app.get('/api/bookings/:id',(req,res)=>{
  const booking=db.bookings.find(b=>b.id===req.params.id);
  if(!booking) return res.status(404).json({error:'Booking not found.'});
  res.json(booking);
});

app.listen(PORT,()=>console.log('SkillSwap backend running on port '+PORT));