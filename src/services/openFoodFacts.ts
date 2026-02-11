import { FoodItem, FoodCategory } from "@/data/foods";

const BASE_URL = "https://world.openfoodfacts.org/api/v0";

export interface OpenFoodFactsProduct {
    code: string;
    product: {
        product_name_es?: string;
        product_name?: string;
        brands?: string;
        image_url?: string;
        nutriments: {
            "energy-kcal_100g"?: number;
            proteins_100g?: number;
            carbohydrates_100g?: number;
            fat_100g?: number;
            fiber_100g?: number;
        };
        categories_tags?: string[];
    };
    status: number;
}

export const searchProductByBarcode = async (barcode: string): Promise<FoodItem | null> => {
    try {
        const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
        const data: OpenFoodFactsProduct = await response.json();

        if (data.status !== 1 || !data.product) {
            return null;
        }

        const p = data.product;

        // Map OFF metrics to our format
        const name = p.product_name_es || p.product_name || "Producto desconocido";
        const brand = p.brands ? ` (${p.brands})` : "";
        const fullName = `${name}${brand}`;

        // Simple category mapping based on tags
        let category: FoodCategory = "snacks"; // Default
        const tags = p.categories_tags || [];

        if (tags.some(t => t.includes("meats") || t.includes("fishes") || t.includes("chicken"))) category = "proteínas";
        else if (tags.some(t => t.includes("fruits"))) category = "frutas";
        else if (tags.some(t => t.includes("vegetables"))) category = "verduras";
        else if (tags.some(t => t.includes("dairies") || t.includes("milks") || t.includes("yogurts"))) category = "lácteos";
        else if (tags.some(t => t.includes("cereals") || t.includes("breads") || t.includes("pastas"))) category = "carbohidratos";

        return {
            id: `off_${data.code}`,
            name: fullName,
            category,
            calories: p.nutriments["energy-kcal_100g"] || 0,
            protein: p.nutriments.proteins_100g || 0,
            carbs: p.nutriments.carbohydrates_100g || 0,
            fat: p.nutriments.fat_100g || 0,
            fiber: p.nutriments.fiber_100g || 0,
        };
    } catch (error) {
        console.error("Error fetching product from OpenFoodFacts:", error);
        return null;
    }
};
