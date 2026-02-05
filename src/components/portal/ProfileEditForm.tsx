'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { US_STATES } from '@/lib/constants'
import type { Provider, Category, Service, Industry } from '@/types/database'

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  headshot_url: z.string().url().optional().or(z.literal('')).nullable(),
  logo_url: z.string().url().optional().or(z.literal('')).nullable(),
  tagline: z.string().max(200).optional(),
  bio: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  is_remote: z.boolean().default(false),
  deal_size_min: z.coerce.number().optional().nullable(),
  deal_size_max: z.coerce.number().optional().nullable(),
  years_experience: z.coerce.number().optional().nullable(),
  deals_closed: z.coerce.number().optional().nullable(),
  category_ids: z.array(z.string()).default([]),
  service_ids: z.array(z.string()).default([]),
  industry_ids: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof formSchema>

interface ProfileEditFormProps {
  provider: Provider
  categories: Category[]
  services: Service[]
  industries: Industry[]
  providerCategories: string[]
  providerServices: string[]
  providerIndustries: string[]
}

export function ProfileEditForm({
  provider,
  categories,
  services,
  industries,
  providerCategories,
  providerServices,
  providerIndustries,
}: ProfileEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: provider.name || '',
      company_name: provider.company_name || '',
      phone: provider.phone || '',
      website: provider.website || '',
      linkedin: provider.linkedin || '',
      headshot_url: provider.headshot_url || '',
      logo_url: provider.logo_url || '',
      tagline: provider.tagline || '',
      bio: provider.bio || '',
      city: provider.city || '',
      state: provider.state || '',
      is_remote: provider.is_remote || false,
      deal_size_min: provider.deal_size_min || null,
      deal_size_max: provider.deal_size_max || null,
      years_experience: provider.years_experience || null,
      deals_closed: provider.deals_closed || null,
      category_ids: providerCategories,
      service_ids: providerServices,
      industry_ids: providerIndustries,
    },
  })

  // Reset form when provider changes
  useEffect(() => {
    form.reset({
      name: provider.name || '',
      company_name: provider.company_name || '',
      phone: provider.phone || '',
      website: provider.website || '',
      linkedin: provider.linkedin || '',
      headshot_url: provider.headshot_url || '',
      logo_url: provider.logo_url || '',
      tagline: provider.tagline || '',
      bio: provider.bio || '',
      city: provider.city || '',
      state: provider.state || '',
      is_remote: provider.is_remote || false,
      deal_size_min: provider.deal_size_min || null,
      deal_size_max: provider.deal_size_max || null,
      years_experience: provider.years_experience || null,
      deals_closed: provider.deals_closed || null,
      category_ids: providerCategories,
      service_ids: providerServices,
      industry_ids: providerIndustries,
    })
  }, [provider, providerCategories, providerServices, providerIndustries, form])

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith & Associates, LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/johnsmith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="headshot_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headshot</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onUpload={async (file) => {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('folder', 'headshots')
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          })
                          if (!res.ok) {
                            const err = await res.json()
                            throw new Error(err.error || 'Upload failed')
                          }
                          const data = await res.json()
                          return data.url
                        }}
                        aspectRatio="square"
                        label="Upload Headshot"
                      />
                    </FormControl>
                    <FormDescription>
                      Professional photo of yourself
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onUpload={async (file) => {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('folder', 'logos')
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          })
                          if (!res.ok) {
                            const err = await res.json()
                            throw new Error(err.error || 'Upload failed')
                          }
                          const data = await res.json()
                          return data.url
                        }}
                        aspectRatio="square"
                        label="Upload Logo"
                      />
                    </FormControl>
                    <FormDescription>
                      Your company or business logo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of expertise..."
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Max 200 characters. Shown on cards and search results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of background and expertise..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Austin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.label}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_remote"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    Works with remote clients
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Experience & Deal Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deal_size_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Deal Size ($K)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>In thousands (e.g., 500 = $500K)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deal_size_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Deal Size ($K)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>In thousands (e.g., 10000 = $10M)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deals_closed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deals Closed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories & Services */}
        <Card>
          <CardHeader>
            <CardTitle>Categories & Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="category_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="category_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, category.id])
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== category.id)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 text-sm cursor-pointer">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="service_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Services</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {services.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="service_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, service.id])
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== service.id)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 text-sm cursor-pointer">
                              {service.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="industry_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Industry Specializations</FormLabel>
                  <FormDescription>
                    Select the industries you specialize in
                  </FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {industries.map((industry) => (
                      <FormField
                        key={industry.id}
                        control={form.control}
                        name="industry_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(industry.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, industry.id])
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== industry.id)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 text-sm cursor-pointer">
                              {industry.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
