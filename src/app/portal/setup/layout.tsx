// Simple layout for setup page - no portal navigation
// This page is shown to users who are logged in but don't have a provider linked

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
