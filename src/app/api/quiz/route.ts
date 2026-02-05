import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuizMatchedProvider, QuizLeadInsert } from '@/types/database'
import { headers } from 'next/headers'

// GET: Fetch categories for the quiz
export async function GET() {
  const supabase = await createClient()

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, icon')
      .order('display_order')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Quiz GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Submit quiz and get matched providers
export async function POST(request: Request) {
  const supabase = await createClient()
  const headersList = await headers()

  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      companyName,
      serviceNeeds,
      dealSizeRange,
      locationPreference,
      timeline,
      additionalNotes,
    } = body

    // Validate required fields
    if (!name || !email || !serviceNeeds || serviceNeeds.length === 0) {
      return NextResponse.json(
        { error: 'Name, email, and at least one service need are required' },
        { status: 400 }
      )
    }

    // Match providers using the database function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: matchedProviders, error: matchError } = await (supabase as any).rpc(
      'match_quiz_providers',
      {
        p_service_needs: serviceNeeds,
        p_deal_size_range: dealSizeRange || null,
        p_location_preference: locationPreference || null,
        p_limit: 5,
      }
    )

    if (matchError) {
      console.error('Match error:', matchError)
      return NextResponse.json({ error: 'Failed to match providers' }, { status: 500 })
    }

    const providers = (matchedProviders || []) as QuizMatchedProvider[]

    // Get categories for matched providers
    const providerIds = providers.map((p) => p.id)
    let providerCategories: Record<string, { id: string; name: string; slug: string }[]> = {}

    if (providerIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: categoriesData } = await (supabase.from('provider_categories') as any)
        .select('provider_id, categories(id, name, slug)')
        .in('provider_id', providerIds)

      if (categoriesData) {
        providerCategories = categoriesData.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc: Record<string, { id: string; name: string; slug: string }[]>, pc: any) => {
            const cat = pc.categories as { id: string; name: string; slug: string } | null
            if (cat) {
              if (!acc[pc.provider_id]) {
                acc[pc.provider_id] = []
              }
              acc[pc.provider_id].push(cat)
            }
            return acc
          },
          {}
        )
      }
    }

    // Add categories to providers
    const providersWithCategories = providers.map((p) => ({
      ...p,
      categories: providerCategories[p.id] || [],
    }))

    // Build match scores object
    const matchScores: Record<string, number> = {}
    providers.forEach((p) => {
      matchScores[p.id] = p.match_score
    })

    // Save the quiz lead
    const quizLead: QuizLeadInsert = {
      name,
      email,
      phone: phone || null,
      company_name: companyName || null,
      service_needs: serviceNeeds,
      deal_size_range: dealSizeRange || null,
      location_preference: locationPreference || null,
      timeline: timeline || null,
      additional_notes: additionalNotes || null,
      matched_provider_ids: providerIds,
      match_scores: matchScores,
      ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null,
      user_agent: headersList.get('user-agent') || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savedLead, error: saveError } = await (supabase.from('quiz_leads') as any)
      .insert(quizLead)
      .select('id')
      .single()

    if (saveError) {
      console.error('Save lead error:', saveError)
      // Don't fail the request if saving the lead fails
      // Just log it and continue returning the matched providers
    }

    return NextResponse.json({
      leadId: savedLead?.id || null,
      providers: providersWithCategories,
      totalMatched: providers.length,
    })
  } catch (error) {
    console.error('Quiz POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
