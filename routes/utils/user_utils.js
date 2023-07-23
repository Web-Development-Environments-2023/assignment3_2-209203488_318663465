const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO FavoriteRecipes (recipe_id, user_id) VALUES ('${recipe_id}', '${user_id}')`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getSeenRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from SeenRecipes where user_id='${user_id}'`);
    return recipes_id;
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getSeenRecipes = getSeenRecipes;
