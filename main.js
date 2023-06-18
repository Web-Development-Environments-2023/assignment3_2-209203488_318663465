require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
const Rutils = require("./routes/utils/recipes_utils");
var cors = require('cors')
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    //secret: process.env.COOKIE_SECRET, // the encryption key
    secret: "template", // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 20 sec
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    cookie: {
      httpOnly: false,
    }
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files
//local:
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//remote:



const corsConfig = {
  origin: true,
  credentials: true
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

var port = process.env.PORT || "3000"; //local=3000 remote=80
//#endregion
const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");



// app.use(express.static(path.join(__dirname, '../assignment-3-3-basic/dist')));
app.get("/rand", async function(req, res, next) {
  try {
    let random = [];
      const response = await axios.get(`${api_domain}/random`, {
        params: {
          number: 3,
          // tags: 'vegetarian,dessert',
          apiKey: process.env.spooncular_apiKey

        }
      });
    // console.log(response.data.recipes.length);
    // res.status(200).json(response.data); // Send 'random' array as JSON response
    let recipes_id = []
    for (let i=0;i<response.data.recipes.length;i++){
      recipes_id[i] = response.data.recipes[i].id;
    }
    let result = await Rutils.getRecipesPreview(recipes_id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});


app.get("/last", async function(req, res, next) {
  if(req.session.user_id !=null){

  try {
      const recipes_id = await DButils.execQuery(`select recipe_id from lastrecipes where user_id='${user_id}'`);
       let result = await Rutils.getRecipesPreview(recipes_id);
       res.status(200).json(result);

  }
 catch (error) {
  next(error);
}

}});

// const corsConfig = {
//   origin: "http://localhost:8080/", // Allow requests from this origin
//   credentials: true
// };

// app.use(cors(corsConfig));
// app.options("*", cors(corsConfig));


//#region cookie middleware
app.use(function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
  }
});
//#endregion

// ----> For checking that our server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use("/users", user);
app.use("/recipes", recipes);
app.use(auth);

// Default router
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});



const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
