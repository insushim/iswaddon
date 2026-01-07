import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserConcept, analyzeEntityConcept, analyzeItemConcept, analyzeBlockConcept } from '@/lib/ai/ConceptAnalyzer';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concept, conceptType = 'auto', detailed = true, language = 'ko' } = body;

    if (!concept || concept.length < 5 || concept.length > 5000) {
      return NextResponse.json({ error: 'Invalid concept length (5-5000 characters)' }, { status: 400 });
    }

    const generationId = nanoid();
    const startTime = Date.now();

    try {
      const analysis = await analyzeUserConcept(concept, { conceptType, language, detailed });

      let detailedAnalysis = null;
      if (detailed) {
        switch (analysis.conceptType) {
          case 'entity':
            detailedAnalysis = await analyzeEntityConcept(concept);
            break;
          case 'item':
            detailedAnalysis = await analyzeItemConcept(concept);
            break;
          case 'block':
            detailedAnalysis = await analyzeBlockConcept(concept);
            break;
        }
      }

      const generationTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        generationId,
        analysis,
        detailedAnalysis,
        metadata: {
          generationTimeMs: generationTime,
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        },
      });

    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      return NextResponse.json({
        error: 'AI generation failed',
        details: (aiError as Error).message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Concept Analysis Error:', error);
    return NextResponse.json({
      error: 'Failed to analyze concept',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Concept Analysis API',
    endpoints: {
      POST: {
        description: 'Analyze a Minecraft addon concept',
        body: {
          concept: 'string (required) - The concept to analyze',
          conceptType: 'string (optional) - entity, item, block, addon, or auto',
          detailed: 'boolean (optional) - Whether to generate detailed analysis',
          language: 'string (optional) - ko or en',
        },
      },
    },
  });
}
