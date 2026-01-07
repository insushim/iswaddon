import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserConcept, analyzeEntityConcept, analyzeItemConcept, analyzeBlockConcept } from '@/lib/ai/ConceptAnalyzer';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const requestId = nanoid(8);
  console.log(`[API:ai-concept][${requestId}] ========== Request Start ==========`);

  try {
    const body = await request.json();
    const { concept, conceptType = 'auto', detailed = true, language = 'ko' } = body;

    console.log(`[API:ai-concept][${requestId}] Input:`, {
      concept: concept?.substring(0, 100) + (concept?.length > 100 ? '...' : ''),
      conceptType,
      detailed,
      language,
    });

    if (!concept || concept.length < 5 || concept.length > 5000) {
      console.error(`[API:ai-concept][${requestId}] Invalid concept length: ${concept?.length}`);
      return NextResponse.json({
        error: 'Invalid concept length (5-5000 characters)',
        requestId,
      }, { status: 400 });
    }

    const generationId = nanoid();
    const startTime = Date.now();

    console.log(`[API:ai-concept][${requestId}] Starting analysis with generationId: ${generationId}`);

    try {
      // Step 1: Basic concept analysis
      console.log(`[API:ai-concept][${requestId}] Step 1: Analyzing user concept...`);
      const analysis = await analyzeUserConcept(concept, { conceptType, language, detailed });
      console.log(`[API:ai-concept][${requestId}] Step 1 complete. Detected type: ${analysis.conceptType}`);

      // Step 2: Detailed analysis based on type
      let detailedAnalysis = null;
      if (detailed) {
        console.log(`[API:ai-concept][${requestId}] Step 2: Generating detailed ${analysis.conceptType} analysis...`);

        try {
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
            default:
              console.log(`[API:ai-concept][${requestId}] Unknown concept type: ${analysis.conceptType}, skipping detailed analysis`);
          }
          console.log(`[API:ai-concept][${requestId}] Step 2 complete`);
        } catch (detailedError) {
          console.error(`[API:ai-concept][${requestId}] Step 2 failed:`, detailedError);
          // Continue without detailed analysis
        }
      }

      const generationTime = Date.now() - startTime;
      console.log(`[API:ai-concept][${requestId}] ========== Request Complete in ${generationTime}ms ==========`);

      return NextResponse.json({
        success: true,
        generationId,
        requestId,
        analysis,
        detailedAnalysis,
        metadata: {
          generationTimeMs: generationTime,
          model: 'gemini-2.0-flash',
        },
      });

    } catch (aiError) {
      const errorMessage = (aiError as Error).message;
      const errorStack = (aiError as Error).stack;

      console.error(`[API:ai-concept][${requestId}] AI Generation Error:`, {
        message: errorMessage,
        stack: errorStack,
        name: (aiError as Error).name,
      });

      return NextResponse.json({
        error: 'AI generation failed',
        details: errorMessage,
        requestId,
        errorType: (aiError as Error).name,
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = (error as Error).message;
    const errorStack = (error as Error).stack;

    console.error(`[API:ai-concept][${requestId}] Request Error:`, {
      message: errorMessage,
      stack: errorStack,
      name: (error as Error).name,
    });

    return NextResponse.json({
      error: 'Failed to process request',
      details: errorMessage,
      requestId,
      errorType: (error as Error).name,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Concept Analysis API',
    model: 'gemini-2.0-flash',
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
