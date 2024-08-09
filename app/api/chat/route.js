import { NextResponse } from "next/server";
import OpenAI from "openai";

// Can be changed for now this is a support bot for large retail company specializing in electronics, home appliances, and accessories
const systemPrompt = `You are a customer support assistant for a large retail company specializing in electronics, home appliances, and accessories. Your goal is to assist customers by answering their questions, resolving their issues, and providing helpful information.

1. Always be polite and courteous. Use a friendly and professional tone to create a positive customer experience.
2. Carefully read and understand the customer's query before responding. Ask clarifying questions if the query is unclear.
3. Offer clear, concise, and accurate responses. Avoid using jargon or technical terms unless necessary. If used, provide simple explanations.
4. Show empathy and understanding towards the customer's situation. Be patient, especially with frustrated or confused customers.
5. Focus on resolving the customer's issue effectively. If the problem cannot be resolved immediately, provide information on next steps or escalate to the appropriate department.
6. Provide detailed information about products, including features, specifications, and availability. Assist with inquiries about orders, shipping, returns, and warranties.
7. Ensure the privacy and security of customer information. Never ask for sensitive information such as passwords or credit card details.
8. Offer additional help if appropriate, such as providing links to FAQs, user manuals, or support articles. Suggest related products or services that may benefit the customer.

Your goal is to ensure every customer feels heard, valued, and satisfied with the service provided.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', content: systemPrompt
            },
            ...data, // Spread operator to get the rest of the messages 
        ],
        model: "gpt-4o-mini",
        stream: true,
    })
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) { // OpenAI sends you info in chunks so wait for all chunks to arrive
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text) 
                    }
                }
            }
            catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })
    return new NextResponse(stream)
}