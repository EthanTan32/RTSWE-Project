import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

async function fetchData(dining_hall) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const dayOfWeek = today.getDay();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    try {
        const response = await fetch(`https://rutgers.api.nutrislice.com/menu/api/weeks/school/${dining_hall}/menu-type/dinner/${year}/${month}/${dayOfMonth}/?format=json`);
        const data = await response.json();
        return data["days"][dayOfWeek]["menu_items"];
    }
    catch (e) {
        console.error(e);
        return undefined;
    }
}

function updateJson(data) {
    const filePath = path.join(process.cwd(), 'app', 'output.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST() {
    const today = new Date();
    const dayOfMonth = today.getDate();

    const busch_data = await fetchData("busch-dining-hall");
    const livi_data = await fetchData("livingston-dining-commons");
    const neil_data = await fetchData("neilson-dining-hall");

    if (busch_data === undefined || livi_data === undefined || neil_data === undefined) {
        return NextResponse.json({ ok: false });
    }

    const combinedData = { date: dayOfMonth, Busch: busch_data, Livingston: livi_data, Neilson: neil_data };
    updateJson(combinedData);
    return NextResponse.json({ ok: true });
}