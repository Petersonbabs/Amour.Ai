import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createGoogleGenerativeAI } from 'npm:@ai-sdk/google'
import { generateText } from 'npm:ai'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const apiKey = Deno.env.get('GEMINI_API_KEY')

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found')
        }

        let body;
        try {
            const rawBody = await req.text();
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            throw new Error("Invalid JSON body");
        }
        const { transaction_id, prompt_data, currency, amount_paid, base_amount_usd } = body;

        // 1. Verify Payment with Flutterwave
        const flwSecretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
        const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${flwSecretKey}`,
                'Content-Type': 'application/json'
            }
        })

        let flwData;
        try {
            const rawFlw = await flwResponse.text();
            const verification = await flwResponse.json();
            if (verification.data.currency !== currency) {
                throw new Error(`Currency mismatch: Expected ${currency}, got ${verification.data.currency}`);
            }

            if (parseFloat(verification.data.amount) !== amount_paid) {
                throw new Error(`Amount mismatch: Expected ${amount_paid} ${currency}, got ${verification.data.amount}`);
            }
            // parsing
            flwData = JSON.parse(rawFlw);
        } catch (e) {
            throw new Error("Flutterwave returned non-JSON");
        }

        if (flwData.status !== 'success' || flwData.data.status !== 'successful') {
            throw new Error('Payment verification failed')
        }

        // 2. Generate Letter with Vercel AI SDK
        const google = createGoogleGenerativeAI({
            apiKey: Deno.env.get('GEMINI_API_KEY')
        });

        const prompt = `Write a ${prompt_data.tone} love letter for my ${prompt_data.relationship}, ${prompt_data.partnerName}.
    My name is ${prompt_data.yourName || 'your secret admirer'}.
    Our relationship duration: ${prompt_data.duration}.
    Key memories: ${prompt_data.memories}.
    What I love about them: ${prompt_data.qualities}.
    
    Make it deeply personal, emotional, and well-structured. Use markdown formatting. Sign it with my name at the end.`;

        const { text } = await generateText({
            model: google('models/gemini-flash-latest'),
            prompt: prompt,
        })

        // 3. Save to Database
        const soupBaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )
        const { data: { user } } = await soupBaseClient.auth.getUser()

        if (user) {
            await soupBaseClient.from('letters').insert({
                user_id: user.id,
                content: text,
                prompt_data: prompt_data,
                is_paid: true,
                transaction_ref: transaction_id,
            })
        }

        return new Response(
            JSON.stringify({
                success: true,
                letter: text,
                currency_info: {
                    original_currency: currency,
                    amount_paid,
                    base_amount_usd,
                    exchange_rate: amount_paid / base_amount_usd
                }
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )

    } catch (error) {
        console.error("Context Error:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message || "Unknown error", stack: error.stack }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
