export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number; // per 100g
  protein: number;  // g per 100g
  carbs: number;    // g per 100g
  fat: number;      // g per 100g
  fiber: number;    // g per 100g
}

export type FoodCategory = 
  | "proteínas" | "carbohidratos" | "frutas" | "verduras" 
  | "lácteos" | "grasas" | "snacks" | "bebidas" | "cereales" | "legumbres"
  | "comidas preparadas" | "salsas" | "panadería";

export const foodCategoryLabels: Record<FoodCategory, string> = {
  proteínas: "Proteínas",
  carbohidratos: "Carbohidratos",
  frutas: "Frutas",
  verduras: "Verduras",
  lácteos: "Lácteos",
  grasas: "Grasas saludables",
  snacks: "Snacks",
  bebidas: "Bebidas",
  cereales: "Cereales",
  legumbres: "Legumbres",
  "comidas preparadas": "Comidas preparadas",
  salsas: "Salsas y condimentos",
  panadería: "Panadería y repostería",
};

export const foodCategoryIcons: Record<FoodCategory, string> = {
  proteínas: "🥩",
  carbohidratos: "🍚",
  frutas: "🍎",
  verduras: "🥦",
  lácteos: "🥛",
  grasas: "🥑",
  snacks: "🍫",
  bebidas: "🥤",
  cereales: "🌾",
  legumbres: "🫘",
  "comidas preparadas": "🍽️",
  salsas: "🫙",
  panadería: "🥐",
};

export const foods: FoodItem[] = [
  // PROTEÍNAS
  { id: "f1", name: "Pechuga de pollo", category: "proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: "f2", name: "Pechuga de pavo", category: "proteínas", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 },
  { id: "f3", name: "Ternera magra", category: "proteínas", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  { id: "f4", name: "Salmón", category: "proteínas", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { id: "f5", name: "Atún fresco", category: "proteínas", calories: 144, protein: 23, carbs: 0, fat: 5, fiber: 0 },
  { id: "f6", name: "Atún en lata (natural)", category: "proteínas", calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
  { id: "f7", name: "Huevo entero", category: "proteínas", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  { id: "f8", name: "Clara de huevo", category: "proteínas", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: "f9", name: "Merluza", category: "proteínas", calories: 86, protein: 17, carbs: 0, fat: 1.3, fiber: 0 },
  { id: "f10", name: "Gambas", category: "proteínas", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: "f11", name: "Cerdo lomo", category: "proteínas", calories: 143, protein: 27, carbs: 0, fat: 3.5, fiber: 0 },
  { id: "f12", name: "Tofu", category: "proteínas", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { id: "f13", name: "Whey protein (scoop)", category: "proteínas", calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0 },

  // CARBOHIDRATOS
  { id: "f14", name: "Arroz blanco (cocido)", category: "carbohidratos", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: "f15", name: "Arroz integral (cocido)", category: "carbohidratos", calories: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8 },
  { id: "f16", name: "Pasta (cocida)", category: "carbohidratos", calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { id: "f17", name: "Pan blanco", category: "carbohidratos", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  { id: "f18", name: "Pan integral", category: "carbohidratos", calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
  { id: "f19", name: "Patata (cocida)", category: "carbohidratos", calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8 },
  { id: "f20", name: "Boniato (cocido)", category: "carbohidratos", calories: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3 },
  { id: "f21", name: "Avena", category: "carbohidratos", calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
  { id: "f22", name: "Quinoa (cocida)", category: "carbohidratos", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { id: "f23", name: "Cuscús (cocido)", category: "carbohidratos", calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4 },
  { id: "f24", name: "Tortita de arroz", category: "carbohidratos", calories: 387, protein: 7, carbs: 82, fat: 2.8, fiber: 4.2 },

  // FRUTAS
  { id: "f25", name: "Plátano", category: "frutas", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { id: "f26", name: "Manzana", category: "frutas", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  { id: "f27", name: "Naranja", category: "frutas", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  { id: "f28", name: "Fresas", category: "frutas", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  { id: "f29", name: "Arándanos", category: "frutas", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
  { id: "f30", name: "Sandía", category: "frutas", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  { id: "f31", name: "Uvas", category: "frutas", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { id: "f32", name: "Kiwi", category: "frutas", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3 },
  { id: "f33", name: "Piña", category: "frutas", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  { id: "f34", name: "Mango", category: "frutas", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },

  // VERDURAS
  { id: "f35", name: "Brócoli", category: "verduras", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: "f36", name: "Espinacas", category: "verduras", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: "f37", name: "Tomate", category: "verduras", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: "f38", name: "Pepino", category: "verduras", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: "f39", name: "Lechuga", category: "verduras", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  { id: "f40", name: "Zanahoria", category: "verduras", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: "f41", name: "Cebolla", category: "verduras", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  { id: "f42", name: "Pimiento", category: "verduras", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: "f43", name: "Calabacín", category: "verduras", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  { id: "f44", name: "Champiñones", category: "verduras", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  { id: "f45", name: "Espárragos", category: "verduras", calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1 },
  { id: "f46", name: "Berenjena", category: "verduras", calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },

  // LÁCTEOS
  { id: "f47", name: "Leche entera", category: "lácteos", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  { id: "f48", name: "Leche desnatada", category: "lácteos", calories: 35, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0 },
  { id: "f49", name: "Yogur natural", category: "lácteos", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  { id: "f50", name: "Yogur griego", category: "lácteos", calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 },
  { id: "f51", name: "Queso fresco", category: "lácteos", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: "f52", name: "Queso curado", category: "lácteos", calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  { id: "f53", name: "Requesón", category: "lácteos", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: "f54", name: "Skyr", category: "lácteos", calories: 63, protein: 11, carbs: 4, fat: 0.2, fiber: 0 },

  // GRASAS
  { id: "f55", name: "Aguacate", category: "grasas", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { id: "f56", name: "Aceite de oliva (1 cda)", category: "grasas", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "f57", name: "Almendras", category: "grasas", calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  { id: "f58", name: "Nueces", category: "grasas", calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 7 },
  { id: "f59", name: "Cacahuetes", category: "grasas", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 9 },
  { id: "f60", name: "Mantequilla de cacahuete", category: "grasas", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
  { id: "f61", name: "Semillas de chía", category: "grasas", calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34 },
  { id: "f62", name: "Semillas de lino", category: "grasas", calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27 },

  // LEGUMBRES
  { id: "f63", name: "Garbanzos (cocidos)", category: "legumbres", calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8 },
  { id: "f64", name: "Lentejas (cocidas)", category: "legumbres", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  { id: "f65", name: "Judías blancas (cocidas)", category: "legumbres", calories: 139, protein: 9.7, carbs: 25, fat: 0.5, fiber: 6 },
  { id: "f66", name: "Edamame", category: "legumbres", calories: 121, protein: 12, carbs: 9, fat: 5, fiber: 5 },

  // CEREALES
  { id: "f67", name: "Copos de maíz", category: "cereales", calories: 357, protein: 8, carbs: 84, fat: 0.4, fiber: 3 },
  { id: "f68", name: "Muesli", category: "cereales", calories: 340, protein: 10, carbs: 56, fat: 8, fiber: 8 },
  { id: "f69", name: "Granola", category: "cereales", calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 5 },

  // SNACKS
  { id: "f70", name: "Chocolate negro 85%", category: "snacks", calories: 580, protein: 10, carbs: 22, fat: 46, fiber: 11 },
  { id: "f71", name: "Barrita proteica", category: "snacks", calories: 200, protein: 20, carbs: 22, fat: 6, fiber: 3 },
  { id: "f72", name: "Galletas de arroz", category: "snacks", calories: 392, protein: 7.3, carbs: 85, fat: 2.8, fiber: 1.7 },

  // BEBIDAS
  { id: "f73", name: "Café solo", category: "bebidas", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { id: "f74", name: "Zumo de naranja", category: "bebidas", calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2 },
  { id: "f75", name: "Bebida de avena", category: "bebidas", calories: 43, protein: 0.3, carbs: 7, fat: 1.4, fiber: 0.8 },

  // CARNES PICADAS
  { id: "f118", name: "Carne picada de ternera", category: "proteínas", calories: 254, protein: 17, carbs: 0, fat: 20, fiber: 0 },
  { id: "f119", name: "Carne picada de pollo", category: "proteínas", calories: 143, protein: 17, carbs: 0, fat: 8, fiber: 0 },
  { id: "f120", name: "Carne picada de pavo", category: "proteínas", calories: 148, protein: 20, carbs: 0, fat: 7, fiber: 0 },
  { id: "f121", name: "Carne picada mixta (cerdo-ternera)", category: "proteínas", calories: 230, protein: 17, carbs: 0, fat: 18, fiber: 0 },
  { id: "f122", name: "Carne picada de cerdo", category: "proteínas", calories: 263, protein: 16, carbs: 0, fat: 22, fiber: 0 },
  { id: "f123", name: "Hamburguesa de ternera", category: "proteínas", calories: 240, protein: 18, carbs: 2, fat: 18, fiber: 0 },
  { id: "f124", name: "Hamburguesa de pollo", category: "proteínas", calories: 150, protein: 18, carbs: 3, fat: 7, fiber: 0 },
  { id: "f125", name: "Albóndigas de ternera", category: "proteínas", calories: 220, protein: 15, carbs: 8, fat: 14, fiber: 1 },

  // MÁS CARNES Y PESCADOS
  { id: "f76", name: "Cordero (pierna)", category: "proteínas", calories: 230, protein: 25, carbs: 0, fat: 14, fiber: 0 },
  { id: "f77", name: "Pato (pechuga)", category: "proteínas", calories: 135, protein: 19, carbs: 0, fat: 6, fiber: 0 },
  { id: "f78", name: "Bacalao", category: "proteínas", calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0 },
  { id: "f79", name: "Sardinas", category: "proteínas", calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0 },
  { id: "f80", name: "Pulpo", category: "proteínas", calories: 82, protein: 15, carbs: 2.2, fat: 1, fiber: 0 },
  { id: "f81", name: "Mejillones", category: "proteínas", calories: 86, protein: 12, carbs: 3.7, fat: 2.2, fiber: 0 },
  { id: "f82", name: "Conejo", category: "proteínas", calories: 136, protein: 20, carbs: 0, fat: 6, fiber: 0 },
  { id: "f83", name: "Codorniz", category: "proteínas", calories: 134, protein: 22, carbs: 0, fat: 5, fiber: 0 },
  { id: "f84", name: "Dorada", category: "proteínas", calories: 96, protein: 20, carbs: 0, fat: 1.5, fiber: 0 },
  { id: "f85", name: "Calamar", category: "proteínas", calories: 92, protein: 16, carbs: 3.1, fat: 1.4, fiber: 0 },
  { id: "f86", name: "Jamón serrano", category: "proteínas", calories: 241, protein: 31, carbs: 0, fat: 13, fiber: 0 },
  { id: "f87", name: "Pavo fiambre", category: "proteínas", calories: 105, protein: 17, carbs: 2, fat: 3, fiber: 0 },
  { id: "f126", name: "Jamón cocido (york)", category: "proteínas", calories: 126, protein: 18, carbs: 1.5, fat: 5, fiber: 0 },
  { id: "f127", name: "Chopped", category: "proteínas", calories: 260, protein: 12, carbs: 3, fat: 22, fiber: 0 },
  { id: "f128", name: "Salchichas de pollo", category: "proteínas", calories: 170, protein: 13, carbs: 3, fat: 12, fiber: 0 },
  { id: "f129", name: "Salchichas de cerdo", category: "proteínas", calories: 301, protein: 12, carbs: 2, fat: 27, fiber: 0 },
  { id: "f130", name: "Bacon", category: "proteínas", calories: 541, protein: 37, carbs: 1, fat: 42, fiber: 0 },
  { id: "f131", name: "Pechuga de pollo empanada", category: "proteínas", calories: 220, protein: 18, carbs: 14, fat: 10, fiber: 1 },
  { id: "f132", name: "Palitos de merluza", category: "proteínas", calories: 190, protein: 11, carbs: 17, fat: 8, fiber: 1 },
  { id: "f133", name: "Surimi (palitos de cangrejo)", category: "proteínas", calories: 88, protein: 8, carbs: 11, fat: 0.5, fiber: 0 },
  { id: "f134", name: "Anchoas en aceite", category: "proteínas", calories: 210, protein: 29, carbs: 0, fat: 10, fiber: 0 },
  { id: "f135", name: "Caballa en conserva", category: "proteínas", calories: 206, protein: 19, carbs: 0, fat: 14, fiber: 0 },

  // MÁS LÁCTEOS Y SUPERMERCADO
  { id: "f136", name: "Queso en lonchas", category: "lácteos", calories: 310, protein: 22, carbs: 2, fat: 24, fiber: 0 },
  { id: "f137", name: "Queso rallado", category: "lácteos", calories: 380, protein: 28, carbs: 3, fat: 29, fiber: 0 },
  { id: "f138", name: "Queso crema", category: "lácteos", calories: 342, protein: 6, carbs: 4, fat: 34, fiber: 0 },
  { id: "f139", name: "Natillas", category: "lácteos", calories: 122, protein: 3.5, carbs: 18, fat: 4, fiber: 0 },
  { id: "f140", name: "Flan de huevo", category: "lácteos", calories: 130, protein: 4, carbs: 20, fat: 4, fiber: 0 },
  { id: "f141", name: "Yogur de proteínas", category: "lácteos", calories: 67, protein: 10, carbs: 5, fat: 0.5, fiber: 0 },
  { id: "f142", name: "Batido de proteínas (brick)", category: "lácteos", calories: 70, protein: 12, carbs: 4, fat: 1, fiber: 0 },
  { id: "f143", name: "Nata para cocinar", category: "lácteos", calories: 195, protein: 2.5, carbs: 4, fat: 19, fiber: 0 },
  { id: "f144", name: "Leche de almendras", category: "bebidas", calories: 24, protein: 0.5, carbs: 3, fat: 1.1, fiber: 0.2 },
  { id: "f145", name: "Leche de soja", category: "bebidas", calories: 44, protein: 3.3, carbs: 3, fat: 1.8, fiber: 0.6 },

  // MÁS COMIDAS PREPARADAS ESTILO SUPERMERCADO
  { id: "f146", name: "Gazpacho", category: "comidas preparadas", calories: 36, protein: 0.7, carbs: 4, fat: 1.8, fiber: 0.5 },
  { id: "f147", name: "Salmorejo", category: "comidas preparadas", calories: 80, protein: 1.5, carbs: 6, fat: 5.5, fiber: 0.8 },
  { id: "f148", name: "Nuggets de pollo", category: "comidas preparadas", calories: 260, protein: 14, carbs: 16, fat: 15, fiber: 1 },
  { id: "f149", name: "San Jacobo", category: "comidas preparadas", calories: 260, protein: 14, carbs: 18, fat: 14, fiber: 1 },
  { id: "f150", name: "Canelones de carne", category: "comidas preparadas", calories: 155, protein: 8, carbs: 14, fat: 7, fiber: 1 },
  { id: "f151", name: "Lasaña boloñesa", category: "comidas preparadas", calories: 148, protein: 8, carbs: 14, fat: 7, fiber: 1 },
  { id: "f152", name: "Arroz tres delicias", category: "comidas preparadas", calories: 155, protein: 4, carbs: 24, fat: 5, fiber: 1 },
  { id: "f153", name: "Fabada asturiana", category: "comidas preparadas", calories: 140, protein: 8, carbs: 14, fat: 6, fiber: 4 },
  { id: "f154", name: "Cocido madrileño", category: "comidas preparadas", calories: 130, protein: 7, carbs: 13, fat: 5, fiber: 3 },
  { id: "f155", name: "Fideuá", category: "comidas preparadas", calories: 145, protein: 7, carbs: 19, fat: 4, fiber: 1 },

  // MÁS SNACKS
  { id: "f156", name: "Patatas fritas (bolsa)", category: "snacks", calories: 536, protein: 7, carbs: 52, fat: 33, fiber: 4 },
  { id: "f157", name: "Palomitas", category: "snacks", calories: 375, protein: 11, carbs: 74, fat: 4.5, fiber: 15 },
  { id: "f158", name: "Frutos secos mix", category: "snacks", calories: 607, protein: 20, carbs: 18, fat: 53, fiber: 8 },
  { id: "f159", name: "Aceitunas", category: "snacks", calories: 115, protein: 0.8, carbs: 6, fat: 11, fiber: 3 },
  { id: "f160", name: "Torreznos", category: "snacks", calories: 544, protein: 38, carbs: 0, fat: 43, fiber: 0 },
  { id: "f161", name: "Chocolate con leche", category: "snacks", calories: 535, protein: 8, carbs: 59, fat: 30, fiber: 2 },
  { id: "f162", name: "Helado de vainilla", category: "snacks", calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0 },

  // MÁS CARBOHIDRATOS
  { id: "f163", name: "Tortillas de trigo (wrap)", category: "carbohidratos", calories: 310, protein: 8, carbs: 52, fat: 8, fiber: 3 },
  { id: "f164", name: "Pasta integral (cocida)", category: "carbohidratos", calories: 124, protein: 5, carbs: 23, fat: 1.1, fiber: 4 },
  { id: "f165", name: "Maíz dulce (lata)", category: "carbohidratos", calories: 82, protein: 3, carbs: 16, fat: 1.2, fiber: 2 },

  // COMIDAS PREPARADAS
  { id: "f88", name: "Pizza margarita", category: "comidas preparadas", calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2 },
  { id: "f89", name: "Hamburguesa con pan", category: "comidas preparadas", calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1 },
  { id: "f90", name: "Tortilla de patatas", category: "comidas preparadas", calories: 126, protein: 6, carbs: 10, fat: 7, fiber: 1 },
  { id: "f91", name: "Ensaladilla rusa", category: "comidas preparadas", calories: 143, protein: 3, carbs: 10, fat: 10, fiber: 2 },
  { id: "f92", name: "Croquetas", category: "comidas preparadas", calories: 230, protein: 7, carbs: 18, fat: 14, fiber: 1 },
  { id: "f93", name: "Empanada de atún", category: "comidas preparadas", calories: 270, protein: 10, carbs: 28, fat: 13, fiber: 1 },
  { id: "f94", name: "Paella de pollo", category: "comidas preparadas", calories: 150, protein: 8, carbs: 20, fat: 4, fiber: 1 },
  { id: "f95", name: "Lentejas estofadas", category: "comidas preparadas", calories: 130, protein: 8, carbs: 17, fat: 3, fiber: 5 },
  { id: "f96", name: "Macarrones boloñesa", category: "comidas preparadas", calories: 160, protein: 8, carbs: 20, fat: 5, fiber: 2 },
  { id: "f97", name: "Pollo asado", category: "comidas preparadas", calories: 190, protein: 27, carbs: 0, fat: 9, fiber: 0 },
  { id: "f98", name: "Wrap de pollo", category: "comidas preparadas", calories: 220, protein: 14, carbs: 22, fat: 9, fiber: 2 },
  { id: "f99", name: "Sushi (maki)", category: "comidas preparadas", calories: 140, protein: 5, carbs: 28, fat: 1, fiber: 1 },

  // SALSAS Y CONDIMENTOS
  { id: "f100", name: "Ketchup", category: "salsas", calories: 112, protein: 1.2, carbs: 26, fat: 0.1, fiber: 0.3 },
  { id: "f101", name: "Mayonesa", category: "salsas", calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0 },
  { id: "f102", name: "Mostaza", category: "salsas", calories: 66, protein: 4, carbs: 6, fat: 3, fiber: 3 },
  { id: "f103", name: "Salsa de soja", category: "salsas", calories: 53, protein: 8, carbs: 5, fat: 0, fiber: 0 },
  { id: "f104", name: "Vinagre balsámico", category: "salsas", calories: 88, protein: 0.5, carbs: 17, fat: 0, fiber: 0 },
  { id: "f105", name: "Hummus", category: "salsas", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6 },
  { id: "f106", name: "Guacamole", category: "salsas", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { id: "f107", name: "Salsa pesto", category: "salsas", calories: 387, protein: 5, carbs: 6, fat: 38, fiber: 2 },
  { id: "f108", name: "Mayonesa light", category: "salsas", calories: 260, protein: 0.8, carbs: 8, fat: 25, fiber: 0 },

  // PANADERÍA Y REPOSTERÍA
  { id: "f109", name: "Croissant", category: "panadería", calories: 406, protein: 8, carbs: 46, fat: 21, fiber: 2 },
  { id: "f110", name: "Magdalena", category: "panadería", calories: 390, protein: 6, carbs: 50, fat: 19, fiber: 1 },
  { id: "f111", name: "Galletas María", category: "panadería", calories: 436, protein: 7, carbs: 74, fat: 13, fiber: 2 },
  { id: "f112", name: "Bizcocho casero", category: "panadería", calories: 350, protein: 5, carbs: 52, fat: 14, fiber: 1 },
  { id: "f113", name: "Tostada integral", category: "panadería", calories: 260, protein: 13, carbs: 43, fat: 4, fiber: 7 },
  { id: "f114", name: "Bagel", category: "panadería", calories: 257, protein: 10, carbs: 50, fat: 1.5, fiber: 2 },
  { id: "f115", name: "Donut", category: "panadería", calories: 421, protein: 5, carbs: 53, fat: 22, fiber: 1 },
  { id: "f116", name: "Pan de molde", category: "panadería", calories: 250, protein: 8, carbs: 47, fat: 3.5, fiber: 4 },
  { id: "f117", name: "Churros", category: "panadería", calories: 360, protein: 4, carbs: 40, fat: 20, fiber: 1 },
];
