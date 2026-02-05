import { BlogPostForm } from '@/components/blog/BlogPostForm'

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Episode</h1>
        <p className="text-muted-foreground">
          Create a new episode of Still Searching with Jed Morris
        </p>
      </div>
      <BlogPostForm isNew />
    </div>
  )
}
