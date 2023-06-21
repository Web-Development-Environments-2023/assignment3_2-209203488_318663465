const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

const DButils = require("./DButils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    const r = recipe_id.toString();
    return await axios.get(`${api_domain}/${r}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipesPreview(array){
    for(let i=0;i<array.length;i++){
        array[i]=await getRecipeDetails(array[i])
        
    }
    return  array ;
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients,analyzedInstructions} = recipe_info.data;
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        extendedIngredients: extendedIngredients,
        analyzedInstructions: analyzedInstructions,
    }
}

async function searchRecipes(req) {
    return axios.get(`${api_domain}/complexSearch`, {
        params: {
          query:req.body.title,
          cuisine:req.body.cuisine,
          diet:req.body.diet,
          intolerances:req.body.intolerances,
          number:req.body.number,
          apiKey: process.env.spooncular_apiKey
  
        }
      });
}
async function getSearchRecipes(query, number, cuisine, diet, intolerances) {
    try {
        let res = await axios.get(`${api_domain}/complexSearch`,{
            params: {
                apiKey: process.env.spooncular_apiKey,
                query: query, 
                number: number,
                cuisine: cuisine, 
                diet: diet,
                intolerance: intolerances,
                fillIngredients: true,
                addRecipeInformation: true,
            }
        });
        res = await getPreviewRecipes(res.data.results);
        return res;
    } catch(error){
        console.log(error); 
    }
}


async function getMyFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await DButils.execQuery(`SELECT * FROM myrecipes WHERE id='${recipe_id}'`);
    let { id, title, readyInMinutes, instructions,image, vegan, vegetarian, glutenFree, numOfDish, extendedIngredients,
        } = recipe_info[0];
    return {
        id: id,
        title: title,
        image: image,
        instructions: instructions,
        readyInMinutes: readyInMinutes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        extendedIngredients: extendedIngredients,
        servings: numOfDish,

    }

}
exports.getMyFullDetailsOfRecipe = getMyFullDetailsOfRecipe;

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipes = searchRecipes;
exports.getSearchRecipes = getSearchRecipes;







