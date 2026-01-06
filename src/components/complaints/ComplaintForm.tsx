'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { createComplaint } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocationPicker } from './LocationPicker';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Complaint
    </Button>
  );
}

export function ComplaintForm() {
  const initialState = undefined;
  const [state, dispatch] = useFormState(createComplaint, initialState);
  const { toast } = useToast();
  const router = useRouter();

  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.message === 'success') {
      toast({
        title: 'Complaint Submitted!',
        description: 'Your complaint has been successfully submitted and categorized.',
      });
      router.push('/student/dashboard');
    } else if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: state.message,
      });
    }
  }, [state, toast, router]);

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng });
    setLocationAddress(address);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={dispatch}>
      {location && <input type="hidden" name="location" value={JSON.stringify(location)} />}
      <input type="hidden" name="locationAddress" value={locationAddress} />
      {imageBase64 && <input type="hidden" name="imageBase64" value={imageBase64} />}
      
      <Card>
        <CardHeader>
          <CardTitle>Submit a New Complaint</CardTitle>
          <CardDescription>
            Please provide details about the issue you are experiencing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g., Broken light in hallway" required />
            {state?.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe the issue in detail..." required />
            {state?.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationPicker onLocationChange={handleLocationChange} />
            <p className="text-sm text-muted-foreground">{locationAddress || 'Select a location on the map.'}</p>
            {state?.errors?.locationAddress && <p className="text-sm font-medium text-destructive">{state.errors.locationAddress[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Attach an Image (Optional)</Label>
            {imageBase64 ? (
              <div className="relative w-full max-w-sm">
                <Image src={imageBase64} alt="Image preview" width={400} height={300} className="rounded-lg object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => setImageBase64('')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" />
                    Add Image
                </Button>
            )}
            <Input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
