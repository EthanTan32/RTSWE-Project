import data from "../../output.json"
import { NextResponse } from 'next/server';

//returns meals.json
function produceJson(meals, dining_hall) {
    const items = data[dining_hall];


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
            let id_start = ""
            switch (dining_hall) {
                case "Busch":
                    id_start = "11111"
                    break;
                case "Livingston":
                    id_start = "22222"
                    break;
                default:
                    id_start = "33333"
            }

            const meal = {
                id: parseInt(id_start+String(i)),
                name: item.name,
                hall: dining_hall,
                calories: nutrition.calories,
                macros: {protein: nutrition.g_protein, carbs: nutrition.g_carbs, fat: nutrition.g_fat},
                dietary: diet_info
            };

            meals.push(meal);

        }
    }
   



}

export async function POST() {
    const today = new Date();
    const dayOfMonth = today.getDate();

    if (data.date != dayOfMonth) {
        console.log("UPDATING");
        const res = await fetch("http://localhost:3000/api/fetch", { method: "POST"});
        const result = await res.json();
    }

    const formatted_data = [];

    produceJson(formatted_data, "Busch");
    produceJson(formatted_data, "Livingston");
    produceJson(formatted_data, "Neilson");

    return NextResponse.json(formatted_data);
}