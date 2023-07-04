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

// async function getPreviewRecipes(res){
//     let response = [];

//     for (let i = 0; i < res.length; i++){
//         let recipeId = res[i].id == undefined ? res[i].recipe_id : res[i].id;
//         if (recipeId == undefined) {
//             recipeId = res[i];
//         }
//         response[i] = await getRecipeDetails(recipeId);
//     }

//     return response;
// }

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
          query:req.body.query,
          cuisine:req.body.cuisine,
          diet:req.body.diet,
          intolerances:req.body.intolerances,
          number:req.body.number,
          apiKey: process.env.spooncular_apiKey
  
        }
      });
}
// async function searchRecipes(query,number,sort,cuisine) {
//     const response = await axios.get(`${api_domain}/complexSearch`, {
//         params: {
//             query: query,
//             number: number,
//             sort: sort,
//             cuisine: cuisine,
//             apiKey: process.env.spooncular_apiKey
//         }
        
//     });
//     return response
// }


async function getSearchResults(query,number,sort,cuisine) {
    let response = await searchRecipes(query,number,sort,cuisine);
    return response.data//extractPreviewRecipeDetails(response.data.recipes);
}

async function getMyFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await DButils.execQuery(`SELECT * FROM myrecipes WHERE id='${recipe_id}'`);
    let { id, title, image, readyInMinutes, popularity, vegan, vegetarian, glutenFree, servings } = recipe_info[0];
    
     
    let instructions = await DButils.execQuery(`SELECT jt.instruction_id, jt.instruction_data
                                               FROM myrecipes,
                                                    JSON_TABLE(instructions,
                                                               '$[*]'
                                                               COLUMNS (
                                                                   instruction_id INT PATH '$.instruction_id',
                                                                   instruction_data VARCHAR(255) PATH '$.instruction_data'
                                                               )
                                                    ) AS jt
                                               WHERE id='${recipe_id}'`);
    let return_instructions = [];

    for (let i = 0; i < instructions.length; i++ ){
        console.log(`len:${instructions.length} instructions: ${instructions[i].instruction_id} + ${instructions[i].instruction_data} `)
        return_instructions.push({ number: instructions[i].instruction_id, step: instructions[i].instruction_data });
    }

    let ingredients = await DButils.execQuery(`SELECT jt.ingredients_id, jt.ingredients_name
    FROM myrecipes,
         JSON_TABLE(extendedIngredients,
                    '$[*]'
                    COLUMNS (
                        ingredients_id INT PATH '$.ingredients_id',
                        ingredients_name VARCHAR(255) PATH '$.ingredients_name'
                    )
         ) AS jt
    WHERE id='${recipe_id}'`);
    let return_ingredients = [];

    for (let i = 0; i < ingredients.length; i++ ){
        console.log(`len:${instructions.length} instructions: ${instructions[i].instruction_id} + ${instructions[i].instruction_data} `)
        return_ingredients.push({ number: i, original: ingredients[i].ingredients_name });
    }


    // let ingredients = await DButils.execQuery(`SELECT * FROM ingredientsrecipes WHERE recipe_id='${recipe_id}'`);
    // let return_ingredients = [];

    // for (let i = 0; i < ingredients.length; i++ ){
    //     return_ingredients.push({number: i, original: ingredients[i].ingredient_name});
    // }
    
    const fullDetails = {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        extendedIngredients: return_ingredients,
        instructions: return_instructions,
        servings: servings,
    }

    return fullDetails;
}

async function search(query,number,sort,cuisine, intolerance, Searchdiet) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query,
            diet: Searchdiet,	
            number: number,
            sort: sort,
            cuisine: cuisine,
            intolerances: intolerance,
            apiKey: process.env.spooncular_apiKey
        }
        
    });
    return response
}



exports.getMyFullDetailsOfRecipe = getMyFullDetailsOfRecipe;

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipes = searchRecipes;
exports.getSearchResults = getSearchResults;
exports.search = search;








