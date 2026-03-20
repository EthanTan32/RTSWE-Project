import data from "../../output.json"
import { NextResponse } from 'next/server';

//returns meals.json
function produceJson() {
    const items = data["days"][1]["menu_items"];
    const meals = []


    for (let i = 0; i < items.length; i++) {
        const item = items[i]["food"];
        if (item !== null && item.name !== null) {
            
            const nutrition = item["rounded_nutrition_info"]
            const diet_data = item["icons"] ? item["icons"]["food_icons"] : null;

            

            const diet_info = []

        if (diet_data !== null) {
        for (const icon of diet_data) {
            const spriteName = icon?.sprite?.name;
            if (spriteName) {
            diet_info.push(spriteName);
            }
        }
        }

            
            

            const meal = {
                id: i,
                name: item.name,
                hall: "busch",
                calories: nutrition.calories,
                macros: {protein: nutrition.g_protein, carbs: nutrition.g_carbs, fat: nutrition.g_fat},
                dietary: diet_info
            };

            meals.push(meal);

        }
    }




    return meals;
   



}

export async function GET() {
    return NextResponse.json(produceJson());
}