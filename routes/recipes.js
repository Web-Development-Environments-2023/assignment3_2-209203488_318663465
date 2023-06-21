var express = require("express");
const DButils = require("../routes/utils/DButils");

var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
router.get("/", (req, res) => res.send("im here"));



router.get('/new', async (req, res, next) => {
  const user_id = req.session.user_id;
  console.log(user_id);


    try {
      const recipes= await DButils.execQuery(`select * from myrecipes where user_id='${user_id}'`);
      console.log(recipes);
      res.send(recipes);
    } catch (error) {
      next(error);
    }
});

router.get("/myFullDetailes", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getMyFullDetailsOfRecipe(req.query.recipeid);
    if (req.session && req.session.user_name){
      recipes_utils.postLastRecipe(req.session.user_name, recipe.id);
    }
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {

const recipe_id=req.params.recipeId
  try {
    const recipe = await recipes_utils.getRecipeDetails(recipe_id);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
//update last-3 for loggedin user
if(req.session.user_id !=null){
const user_id = req.session.user_id;
 watched_recipes = await DButils.execQuery(`select recipe_id from lastrecipes where user_id='${user_id}'`);

 const isWatched = watched_recipes.some(row => row.recipe_id === parseInt(recipe_id));

 if (!isWatched) {
// Remove the oldest recipe ID if there are already three watched recipes
if (watched_recipes.length >= 3) {
 const oldestRecipeId = await DButils.execQuery(`SELECT id FROM lastrecipes WHERE user_id ='${user_id}' ORDER BY id ASC LIMIT 1`);
 await DButils.execQuery(`DELETE FROM lastrecipes WHERE id = '${parseInt(oldestRecipeId[0].id)}' `);

}
  await DButils.execQuery(
    `INSERT INTO lastrecipes (user_id, recipe_id)
    VALUES ('${user_id}', '${recipe_id}')`);

}
}
});


router.get("/search", async (req, res, next) => {
  try {
    console.log(req.query);

    const query = req.query.searchQuery
    const number = parseInt(req.query.number);
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    let intolerances = req.query.intolerances;

    //Maybe Not Needed!!!!!!!!!!!
    if (req.session && req.session.user_name){
      req.session.last_search = query;
    }

    if (intolerances == 'undefined'){
      intolerances = '';
    }

    const recipes = await recipes_utils.getSearchRecipes(query, number, cuisine, diet, intolerances);
    console.log(recipes);
    if (recipes.length == 0){
      res.send("There is no results!");
      return;
    }

    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


router.post('/new', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    let recipe_details = {
      title: req.body.title,
      image_data: req.body.image_data,
      instruction: req.body.instruction,
      time: req.body.time,
      vegetarian: req.body.vegetarian,
      vagan: req.body.vagan,
      Gfree: req.body.Gfree,
      ingredients: req.body.ingredients,
      numOfDish: req.body.numOfDish,
    }

    await DButils.execQuery(
      `INSERT INTO myrecipes (user_id,title, image, instructions, readyInMinutes, vegetarian, vagan, glutenFree, extendedIngredients, servings)
      VALUES ( '${user_id }', '${recipe_details.title}', '${recipe_details.image_data}', '${recipe_details.instruction}',
      '${recipe_details.time}', '${recipe_details.vegetarian}', '${recipe_details.vagan}',
      '${recipe_details.Gfree}', '${recipe_details.ingredients}', '${recipe_details.numOfDish}')`
    );

    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});





module.exports = router;
