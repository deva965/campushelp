import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginIcon } from '@/components/auth/LoginIcon';

export default function SignupPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <LoginIcon />
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details to get started with CampusHelp.
            </p>
          </div>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-accent-foreground font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            width="1200"
            height="1800"
            data-ai-hint={loginImage.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
