import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres FitCoach, un entrenador personal y nutricionista virtual experto en español. Tu objetivo es ayudar al usuario a alcanzar sus metas de fitness y nutrición.

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
      description:
        "Registra ejercicios que el usuario ha realizado o quiere registrar. Usa esto cuando el usuario mencione ejercicios con series, repeticiones o pesos.",
      parameters: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Nombre del ejercicio (ej: Press de banca, Sentadilla)",
                },
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
                  description: "Series realizadas",
                },
              },
              required: ["name", "sets"],
            },
          },
        },
        required: ["exercises"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_meals",
      description:
        "Registra alimentos que el usuario ha comido. Usa esto cuando el usuario mencione comidas o alimentos.",
      parameters: {
        type: "object",
        properties: {
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                food_name: {
                  type: "string",
                  description: "Nombre del alimento (ej: Pechuga de pollo, Arroz blanco)",
                },
                grams: {
                  type: "number",
                  description: "Cantidad en gramos. Si el usuario no especifica, estima una porción razonable.",
                },
                meal_type: {
                  type: "string",
                  enum: ["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"],
                  description: "Tipo de comida. Si no se especifica, infiere por el contexto o la hora.",
                },
              },
              required: ["food_name", "grams", "meal_type"],
            },
          },
        },
        required: ["meals"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Sesión inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request body size (max ~512KB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 524288) {
      return new Response(
        JSON.stringify({ error: "Payload demasiado grande" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "JSON inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate messages structure
    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray((body as any).messages)
    ) {
      return new Response(
        JSON.stringify({ error: "Formato de mensaje inválido: se requiere un array de messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawMessages = (body as any).messages;

    // Limit message count
    if (rawMessages.length === 0 || rawMessages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Se requieren entre 1 y 50 mensajes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message
    const allowedRoles = new Set(["user", "assistant", "system"]);
    const MAX_CONTENT_LENGTH = 10000;
    const messages: Array<{ role: string; content: string }> = [];

    for (const msg of rawMessages) {
      if (
        !msg ||
        typeof msg !== "object" ||
        typeof msg.role !== "string" ||
        !allowedRoles.has(msg.role) ||
        typeof msg.content !== "string" ||
        msg.content.length === 0 ||
        msg.content.length > MAX_CONTENT_LENGTH
      ) {
        return new Response(
          JSON.stringify({ error: "Mensaje inválido: cada mensaje debe tener role (user/assistant/system) y content (1-10000 chars)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      messages.push({ role: msg.role, content: msg.content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          tools,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados. Añade fondos en tu cuenta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
