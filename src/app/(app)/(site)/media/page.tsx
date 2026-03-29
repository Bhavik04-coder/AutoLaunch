import { MediaComponent } from '@/components/media/media.component';
import { Suspense } from 'react';

export const metadata = { title: 'AutoLaunch Media' };

export default function MediaPage() {
  return (
    <Suspense>
      <MediaComponent />
    </Suspense>
  );
}
