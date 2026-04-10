import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gov-blue mx-auto mb-4" />
        <p className="text-gray-600">Buscando...</p>
      </div>
    </div>
  );
}
