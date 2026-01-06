import { Megaphone } from 'lucide-react';
import React from 'react';

export function LoginIcon() {
  return (
    <div className="bg-primary p-3 rounded-full inline-block mb-6 shadow-lg">
      <div className="bg-primary-foreground/20 p-4 rounded-full">
        <Megaphone className="h-8 w-8 text-primary-foreground" />
      </div>
    </div>
  );
}
