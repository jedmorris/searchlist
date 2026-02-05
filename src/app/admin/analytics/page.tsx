'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface AnalyticsData {
  totalProviders: number
  activeProviders: number
  totalInquiries: number
  totalCategories: number
  inquiriesByStatus: Record<string, number>
  inquiriesByMonth: { month: string; count: number }[]
  topProviders: { name: string; company: string; count: number }[]
  recentInquiries: number
  conversionRate: number
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  closed: 'bg-gray-500',
  converted: 'bg-green-500',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
  converted: 'Converted',
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleExport(type: 'inquiries' | 'providers') {
    setIsExporting(type)
    try {
      const res = await fetch(`/api/export/${type}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Export complete',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: `Failed to export ${type}`,
        variant: 'destructive',
      })
    } finally {
      setIsExporting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load analytics data
      </div>
    )
  }

  const totalStatusCount = Object.values(data.inquiriesByStatus).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Analytics</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Overview of your directory performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('providers')}
            disabled={isExporting !== null}
          >
            {isExporting === 'providers' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Providers
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('inquiries')}
            disabled={isExporting !== null}
          >
            {isExporting === 'inquiries' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Inquiries
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Providers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProviders}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeProviders} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentInquiries} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {data.conversionRate.toFixed(1)}%
              {data.conversionRate > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Inquiries marked as converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Service categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inquiries by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiries by Status</CardTitle>
            <CardDescription>
              Current distribution of inquiry statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.inquiriesByStatus).map(([status, count]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[status]}`} />
                      {STATUS_LABELS[status] || status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[status]} transition-all`}
                      style={{
                        width: totalStatusCount > 0 ? `${(count / totalStatusCount) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(data.inquiriesByStatus).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No inquiries yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Inquiries</CardTitle>
            <CardDescription>
              Inquiry volume over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.inquiriesByMonth.length > 0 ? (
                data.inquiriesByMonth.map((item) => {
                  const maxCount = Math.max(...data.inquiriesByMonth.map(m => m.count), 1)
                  return (
                    <div key={item.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.month}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Providers by Inquiries</CardTitle>
          <CardDescription>
            Providers receiving the most inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topProviders.length > 0 ? (
            <div className="space-y-4">
              {data.topProviders.map((provider, index) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      {provider.company && (
                        <p className="text-sm text-muted-foreground">
                          {provider.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {provider.count} {provider.count === 1 ? 'inquiry' : 'inquiries'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No inquiries yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
