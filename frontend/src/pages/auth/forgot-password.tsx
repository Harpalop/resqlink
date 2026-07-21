import { Link } from 'react-router-dom'
import { MailQuestion } from 'lucide-react'
import { AuthLayout } from '@/pages/auth/auth-layout'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
          <MailQuestion className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Password recovery</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          Email-based password recovery ships with the Notification module. Until then, contact
          support or create a new account.
        </p>
        <Badge variant="primary" className="mt-4">
          Coming soon · Module 21
        </Badge>
        <div className="mt-8">
          <Link to="/login" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
