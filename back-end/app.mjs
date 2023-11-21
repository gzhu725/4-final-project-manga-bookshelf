import express from 'express' 
const app = express() //start server

import dotenv from "dotenv" 
dotenv.config() 
import mutler from "multer" 
import morgan from "morgan" 
import url from 'url';
import path from 'path';
import cors from "cors" 
import UserController from './Controller/userController.js';
import * as Jikan from "./helpers/Jikan.js" //import helper function that we want to use
import * as User from "./helpers/User.js"
import forumData from './public/MockComments.json' assert { type: 'json' };

import sampleProfileList from "./public/sampleProfileList.json" assert { type: 'json' }
import sampleProfileData from "./public/sampleProfileData.json" assert { type: 'json' }

//use jwt strategy for auth 
import jwt from "jsonwebtoken" 
import passport from "passport"
import jwtStrategy from "./config/jwt-config.js" 
passport.use(jwtStrategy) //use this jwt strategy within passport for authentication handling
app.use(passport.initialize()) //use the passport middleware 

import mongoose from "mongoose" 
import UserModel from './Model/userModel.js';

// connect to the database
// console.log(`Conneting to MongoDB at ${process.env.MONGODB_URI}`)
mongoose.connect(process.env.DATABASE_URI).then(()=>{
    console.log("connected to MongonDB Atlas")
}).catch(() => {
    console.log("Error")
})

//Define middleware to use here
app.use(morgan("dev")) 
app.use(cors()) 
app.use(express.json()) 
app.use(express.urlencoded({extended:true})); 
app.use("/static", express.static("public"))

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//define the constant routes 
const BASE_ROUTE_AUTH = "auth"
const BASE_ROUTE_MANGA = "manga" 
const BASE_ROUTE_USER = "user"
const BASE_ROUTE_COMMENT = "comment"

//Sample route 
app.get("/", (req,res)=>{
    res.send("Server is working!!"); 
})

//Sample route which sends back image 
app.get("/puppy", (req,res) => {
    const imagePath = path.join(__dirname, 'public/maltese_puppy.jpeg');
    res.sendFile(imagePath);
})

import authenticationRouter from "./routes/authentication-route.js"
import protectedRoutes from './routes/protected-routes.js';

app.use("/auth", authenticationRouter())
app.use("/protected", protectedRoutes())


app.get(`/${BASE_ROUTE_MANGA}`, (req, res) => {
    res.json({ content: "use this route format to send some json" })
})

//send result back with result json 
app.get(`/${BASE_ROUTE_MANGA}/search/:entry`, async (req, res) => {
    const payload = await Jikan.getMangaSearch(req.params.entry)
    res.json({result: payload})
})

//send result back with array
app.get(`/${BASE_ROUTE_MANGA}/search2/:entry`, async (req, res) => {
    const payload = await Jikan.getMangaSearch(req.params.entry)
    res.json(payload)
})

app.get(`/${BASE_ROUTE_MANGA}/search/id/:id`, async (req, res) => {
    const payload = await Jikan.getMangaInfoById(req.params.id);
    res.json({result: payload})
})

app.get(`/${BASE_ROUTE_MANGA}/search2/id/:id`, async (req, res) => {
    const payload = await Jikan.getMangaInfoById(req.params.id);
    res.json(payload)
})

app.get(`/${BASE_ROUTE_MANGA}/mangasearch/:entry`, async (req, res) => {
    //get the top manga's id
    const mangaId = await Jikan.getTopMangaId(req.params.entry) 
    //get that manga's info using the id
    const payload2 = await Jikan.getMangaInfoById(mangaId) 
    res.json(payload2)
})

// Need to set up route which gives a recommendation based on a specific entry (like action, romance, etc)
app.get(`/${BASE_ROUTE_MANGA}/recommendation/:num`, async (req, res) => {
    const payload = await Jikan.getMangaRecommendations(req.params.num)
    res.json({result: payload})  
})

app.get(`/${BASE_ROUTE_MANGA}/recommendation/genre/:genreName`, async (req, res) => {
    const genres = await Jikan.getMangaInfoByGenres(req.params.genreName);
    res.json({ result: genres });
})

app.get(`/${BASE_ROUTE_MANGA}/recent/:num`, async (req, res) => {
    const payload = await Jikan.getRecentMangas(req.params.num)
    res.json({result: payload})
})

app.get(`/${BASE_ROUTE_MANGA}/upcoming/:num`, async (req, res) => {
    const payload = await Jikan.getUpcomingMangas(req.params.num)
    res.json({result: payload})
})

// to show user's follwer and following
app.get(`/${BASE_ROUTE_USER}/:id/followers`, UserController.getUserFollower)
app.get(`/${BASE_ROUTE_USER}/:id/following`, UserController.getUserFollowing)

// to follow a user
app.post(`/${BASE_ROUTE_USER}/:id/follow`, async (req, res) => {
    await User.followUser(req.params.id, req.body.followingId)
    res.send('seccess follow')
})

// to unfollow a user
app.post(`/${BASE_ROUTE_USER}/:id/unfollow`, async (req, res) => {
    await User.unfollowUser(req.params.id, req.body.unfollowingId)
    res.send('success unfollow')
})

// to remove a user
app.post(`/${BASE_ROUTE_USER}/:id/remove`, async (req, res) => {
    // await User.removeUser(req.params.id)
    // await User.unfollowUser(req.params.id, req.body.removingId)
    await User.removeUser(req.params.id, req.body.removingId)
    res.send('success remove')
})

app.get(`/${BASE_ROUTE_COMMENT}/MockComments`, (req, res) => {
    res.json(forumData);
  });

//get the profile lists 
app.get(`/${BASE_ROUTE_USER}/:id/profileInfo`, UserController.getUserData)

app.get('/getProfileLists', (req,res) => {
    res.json(sampleProfileList);
})

export default app; 
