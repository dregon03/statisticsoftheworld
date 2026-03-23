import { TOOL_DEFINITIONS, executeTool, SYSTEM_PROMPT } from '@/lib/chat-tools';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const MODEL = 'mistralai/mistral-small-3.2-24b-instruct';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage: string = body.message;
    const history: ChatMessage[] = body.history || [];

    if (!userMessage || typeof userMessage !== 'string') {
      return Response.json({ error: 'Missing message field' }, { status: 400 });
    }

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    // First call — let Mistral decide if it needs tools
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return Response.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice) {
      return Response.json({ error: 'No response from AI' }, { status: 502 });
    }

    // If no tool calls, return the direct response
    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      return Response.json({
        response: choice.message.content,
        type: 'text',
      });
    }

    // Execute tool calls
    const toolResults: { tool_call_id: string; content: string }[] = [];

    for (const toolCall of choice.message.tool_calls) {
      const fn = toolCall.function;
      let args: Record<string, any>;
      try {
        args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments;
      } catch {
        args = {};
      }

      const result = await executeTool(fn.name, args);
      toolResults.push({
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    // Second call — let Mistral synthesize the tool results
    const followUpMessages = [
      ...messages,
      choice.message, // assistant message with tool_calls
      ...toolResults.map(r => ({
        role: 'tool' as const,
        tool_call_id: r.tool_call_id,
        content: r.content,
      })),
    ];

    const followUpResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: followUpMessages,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!followUpResponse.ok) {
      // If follow-up fails, return raw tool results
      return Response.json({
        response: toolResults.map(r => r.content).join('\n\n'),
        type: 'data',
      });
    }

    const followUpData = await followUpResponse.json();
    const finalContent = followUpData.choices?.[0]?.message?.content;

    return Response.json({
      response: finalContent || toolResults.map(r => r.content).join('\n\n'),
      type: 'text',
      toolsUsed: choice.message.tool_calls.map((tc: any) => tc.function.name),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
