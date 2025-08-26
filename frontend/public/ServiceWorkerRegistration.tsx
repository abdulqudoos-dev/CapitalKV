// components/ServiceWorkerRegistration.tsx
import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []); // Empty dependency array ensures this runs only once, on mount

  return null; // This component does not render anything
};

export default ServiceWorkerRegistration;
