import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
    name: "log_exercises",
    description: "Registra ejercicios que el usuario ha realizado o quiere registrar.",
    parameters: {
      type: "OBJECT",
      properties: {
        exercises: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Nombre del ejercicio" },
              sets: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    reps: { type: "NUMBER", description: "Número de repeticiones" },
                    weight: { type: "NUMBER", description: "Peso en kg" },
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
  {
    name: "log_meals",
    description: "Registra alimentos que el usuario ha comido.",
    parameters: {
      type: "OBJECT",
      properties: {
        meals: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              food_name: { type: "STRING", description: "Nombre del alimento" },
              grams: { type: "NUMBER", description: "Cantidad en gramos" },
              meal_type: {
                type: "STRING",
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
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { messages } = await req.json();

    // Validate message count
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Se requieren entre 1 y 50 mensajes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform messages to Gemini format
    // OpenAI: { role: "user" | "assistant" | "system", content: string }
    // Gemini: { role: "user" | "model", parts: [{ text: string }] }
    const geminiContent = messages
      .filter((m: any) => m.role !== "system") // System prompt is passed separately
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContent,
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools: [{ functionDeclarations: tools }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts || [];

    // Construct OpenAI-compatible response for client compatibility
    let assistantContent = "";
    const toolCalls: any[] = [];

    for (const part of parts) {
      if (part.text) {
        assistantContent += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: Math.random().toString(36).substring(7),
          type: "function",
          function: {
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args),
          },
        });
      }
    }

    // Return in a format the client expects (simulating OpenAI stream or simple JSON)
    // To simplify for now, we'll return a JSON response, but the client expects stream.
    // Let's mimic the stream format or adjust the client. 
    // Adjusting the client is harder strictly from backend.
    // Let's stream the response manually.

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send content
        if (assistantContent) {
          const chunk = {
            choices: [{ delta: { content: assistantContent } }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }

        // Send tool calls
        if (toolCalls.length > 0) {
          const chunk = {
            choices: [{
              delta: {
                tool_calls: toolCalls.map((tc, index) => ({
                  index,
                  id: tc.id,
                  type: "function",
                  function: { name: tc.function.name, arguments: tc.function.arguments }
                }))
              }
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
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
