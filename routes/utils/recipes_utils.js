const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
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
    return array ;
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
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


exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipes = searchRecipes;






