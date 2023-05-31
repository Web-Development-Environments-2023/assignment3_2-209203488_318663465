var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
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
