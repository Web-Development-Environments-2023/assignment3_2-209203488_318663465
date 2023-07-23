var express = require("express");
const DButils = require("../routes/utils/DButils");

var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
router.get("/", (req, res) => res.send("im here"));


//get *my* new recipes
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
//get *family*  recipes
router.get('/Family', async (req, res, next) => {
  const user_id = req.session.user_id;
  console.log(user_id);


    try {
      const recipes= await DButils.execQuery(`select * from family_recipes where user_id='${user_id}'`);
      console.log(recipes);
      res.send(recipes);
    } catch (error) {
      next(error);
    }
});
//get *my* full details from db about recipes

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
//get *family* full details from db about recipes

router.get("/myFamilyFullDetailes", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getFamilyFullDetailsOfRecipe(req.query.recipeid);
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

    await DButils.execQuery(
      `INSERT INTO seenRecipes (recipe_id,user_id)
      VALUES ('${recipe_id}', '${user_id}')`);
  
}
}
});


router.post("/search", async (req, res, next) => {
  try {
    const response = await recipes_utils.searchRecipes(req);
    let recipes_id = []
    for (let i=0;i<response.data.results.length;i++){
      recipes_id[i] = response.data.results[i].id;
    }
    let result = await recipes_utils.getRecipesPreview(recipes_id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

//create *my* new recipes

router.post('/new', async (req, res, next) => {
  try {
    console.log("reach here")
    const user_id = req.session.user_id;

    let recipe_details = {
      title: req.body.title,
      image: req.body.image,
      instructions: req.body.instructions,
      readyInMinutes: req.body.readyInMinutes,
      vegetarian: req.body.vegetarian,
      vagan: req.body.vagan,
      glutenFree: req.body.glutenFree,
      extendedIngredients: req.body.extendedIngredients,
      servings: req.body.servings,
      aggregateLikes:req.body.aggregateLikes
    }

    await DButils.execQuery(
      `INSERT INTO myrecipes (user_id,title, image, instructions, readyInMinutes, vegetarian, vagan, glutenFree, extendedIngredients, servings)
      VALUES ( '${user_id }', '${recipe_details.title}', '${recipe_details.image}', '${recipe_details.instructions}',
      '${recipe_details.readyInMinutes}', '${recipe_details.vegetarian}', '${recipe_details.vagan}',
      '${recipe_details.glutenFree}', '${recipe_details.extendedIngredients}', '${recipe_details.servings}')`
    );
    console.log("reach here2")

    res.status(200).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});





module.exports = router;
