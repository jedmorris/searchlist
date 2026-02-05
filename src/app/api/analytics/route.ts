import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get total providers
    const { count: totalProviders } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })

    // Get active providers
    const { count: activeProviders } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get total inquiries
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })

    // Get total categories
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    // Get inquiries by status
    const { data: inquiriesData } = await supabase
      .from('inquiries')
      .select('status')

    const inquiriesByStatus: Record<string, number> = {
      new: 0,
      contacted: 0,
      closed: 0,
      converted: 0,
    }

    inquiriesData?.forEach((inquiry: { status: string | null }) => {
      const status = inquiry.status || 'new'
      inquiriesByStatus[status] = (inquiriesByStatus[status] || 0) + 1
    })

    // Calculate conversion rate
    const totalInquiriesCount = totalInquiries || 0
    const convertedCount = inquiriesByStatus.converted || 0
    const conversionRate = totalInquiriesCount > 0
      ? (convertedCount / totalInquiriesCount) * 100
      : 0

    // Get inquiries from this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: recentInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Get inquiries by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const { data: monthlyInquiries } = await supabase
      .from('inquiries')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at')

    const monthCounts: Record<string, number> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      monthCounts[key] = 0
    }

    monthlyInquiries?.forEach((inquiry: { created_at: string }) => {
      const date = new Date(inquiry.created_at)
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      if (key in monthCounts) {
        monthCounts[key]++
      }
    })

    const inquiriesByMonth = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
    }))

    // Get top providers by inquiry count
    const { data: providerInquiries } = await supabase
      .from('inquiries')
      .select('provider_id, providers(name, company_name)')

    const providerCounts: Record<string, { name: string; company: string; count: number }> = {}

    providerInquiries?.forEach((inquiry: {
      provider_id: string
      providers: { name: string; company_name: string | null } | null
    }) => {
      const id = inquiry.provider_id
      if (!providerCounts[id]) {
        providerCounts[id] = {
          name: inquiry.providers?.name || 'Unknown',
          company: inquiry.providers?.company_name || '',
          count: 0,
        }
      }
      providerCounts[id].count++
    })

    const topProviders = Object.values(providerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      totalProviders: totalProviders || 0,
      activeProviders: activeProviders || 0,
      totalInquiries: totalInquiriesCount,
      totalCategories: totalCategories || 0,
      inquiriesByStatus,
      inquiriesByMonth,
      topProviders,
      recentInquiries: recentInquiries || 0,
      conversionRate,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
