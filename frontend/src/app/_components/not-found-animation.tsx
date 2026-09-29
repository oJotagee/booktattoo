'use client';

import { LottieLight } from 'lottie-react';
import { useState } from 'react';

import animationData from '../../../public/animation/ERROR-404.json';

export function NotFoundAnimation() {
  const [ready, setReady] = useState(false);

  return (
    <LottieLight
      src={animationData}
      loop
      autoplay
      subscriptions={{ ready: () => setReady(true) }}
      className={`size-full transition-opacity duration-500 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
