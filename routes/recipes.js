var express = require("express");
const DButils = require("../routes/utils/DButils");

var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {

const recipe_id=req.params.recipeId
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
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

module.exports = router;
