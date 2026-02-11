import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_INSTRUCTION = `Eres FitCoach, un entrenador personal y nutricionista virtual experto en español. Tu objetivo es ayudar al usuario a alcanzar sus metas de fitness y nutrición.

## Tus capacidades:
1. **Registrar ejercicios**: Cuando el usuario mencione que ha hecho o quiere hacer ejercicios, usa la herramienta log_exercises para registrarlos.
2. **Registrar comidas**: Cuando el usuario mencione que ha comido algo, usa la herramienta log_meals para registrar los alimentos.
3. **Dar consejos**: Ofrece consejos personalizados sobre entrenamiento, nutrición y recuperación.
4. **Crear rutinas**: Sugiere rutinas de entrenamiento adaptadas a los objetivos del usuario.
5. **Planificar comidas**: Sugiere planes de alimentación basados en los objetivos calóricos y de macros.

## Base de datos de ejercicios disponibles:
Los grupos musculares son: pecho, espalda, hombros, bíceps, tríceps, piernas, glúteos, abdominales, antebrazos, trapecio.
Los tipos de ejercicio son: libre, máquina, cable, barra, mancuerna, peso corporal.

Algunos ejercicios clave: Press de banca, Press inclinado, Aperturas, Dominadas, Remo con barra, Jalón al pecho, Peso muerto, Press militar, Elevaciones laterales, Curl con barra, Curl martillo, Press francés, Extensión tríceps en polea, Sentadilla, Prensa de piernas, Extensión de cuádriceps, Curl de piernas, Hip thrust, Crunch abdominal, Plancha.

## Base de datos de alimentos disponibles:
Categorías: proteínas, carbohidratos, frutas, verduras, lácteos, grasas, snacks, bebidas, cereales, legumbres.
Alimentos con macros por 100g disponibles en la app.

## Reglas:
- Responde siempre en español
- Sé motivador y positivo pero profesional
- Cuando el usuario diga algo como "he hecho 4 series de press de banca a 80kg" o "he comido 200g de pollo con arroz", extrae la información y usa las herramientas correspondientes
- Si no estás seguro de los datos, pregunta al usuario para confirmar
- Usa emojis moderadamente para hacer la conversación más amena
- Mantén las respuestas concisas pero informativas
- Cuando registres algo, confirma lo que has registrado`;

const tools = [
  {
    type: "function",
    function: {
      name: "log_exercises",
      description: "Registra ejercicios que el usuario ha realizado o quiere registrar.",
      parameters: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre del ejercicio" },
                sets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reps: { type: "number", description: "Número de repeticiones" },
                      weight: { type: "number", description: "Peso en kg" },
                    },
                    required: ["reps", "weight"],
                  },
                },
              },
              required: ["name", "sets"],
            },
          },
        },
        required: ["exercises"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_meals",
      description: "Registra alimentos que el usuario ha comido.",
      parameters: {
        type: "object",
        properties: {
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                food_name: { type: "string", description: "Nombre del alimento" },
                grams: { type: "number", description: "Cantidad en gramos" },
                meal_type: {
                  type: "string",
                  enum: ["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"],
                  description: "Tipo de comida",
                },
              },
              required: ["food_name", "grams", "meal_type"],
            },
          },
        },
        required: ["meals"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages } = await req.json();

    // Validate message count
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Se requieren entre 1 y 50 mensajes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Añade fondos en la configuración de tu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      throw new Error(`AI Gateway Error: ${response.statusText}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
