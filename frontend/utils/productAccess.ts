// utils/productAccess.ts

export interface ProductAccessInfo {
  accessStatus: 'available' | 'early_access' | 'countdown' | 'hidden';
  countdownInfo?: {
    days: number;
    hours: number;
    minutes: number;
    display: string;
    expired: boolean;
    total_seconds: number;
  };
  canPurchase: boolean;
  message?: string;
}

export interface Product {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  image_url?: string;
  active: boolean;
  features?: string[];
  category?: string;
  interval?: string;
  interval_count?: number;
  // Early Access Fields
  early_access_date?: string;
  release_date?: string;
  subscriber_tier_required?: string;
  // Access control info (from API)
  access_status?: string;
  countdown_info?: any;
}

export const getProductAccessStatus = (
  product: Product,
  userSubscription?: string
): ProductAccessInfo => {
  const now = new Date();
  
  // If no early access configured, product is available to everyone
  if (!product.early_access_date || !product.release_date) {
    return {
      accessStatus: 'available',
      canPurchase: true,
    };
  }

  const earlyAccessDate = new Date(product.early_access_date);
  const releaseDate = new Date(product.release_date);

  // Check if generally available (past release date)
  if (now >= releaseDate) {
    return {
      accessStatus: 'available',
      canPurchase: true,
    };
  }

  // Check if in early access period
  if (now >= earlyAccessDate) {
    // User has required subscription for early access
    if (userSubscription && 
        product.subscriber_tier_required && 
        hasRequiredSubscription(userSubscription, product.subscriber_tier_required)) {
      return {
        accessStatus: 'early_access',
        canPurchase: true,
        message: 'Early Access - CapitalKV Exclusive Members Only'
      };
    } else {
      // In early access period but user doesn't have required subscription
      const countdown = calculateCountdown(now, releaseDate);
      return {
        accessStatus: 'countdown',
        countdownInfo: countdown,
        canPurchase: false,
        message: `Available in ${countdown.display}`
      };
    }
  }

  // Before early access period - completely hidden
  return {
    accessStatus: 'hidden',
    canPurchase: false,
    message: 'Coming Soon'
  };
};

const hasRequiredSubscription = (userSubscription: string, requiredTier: string): boolean => {
  const exclusiveSubscriptions = [
    'Active CapitalKV Exclusive',
    'CapitalKV Exclusive'
  ];
  
  const plusSubscriptions = [
    'Active CapitalKV+',
    'CapitalKV+'
  ];

  if (requiredTier === 'CapitalKV Exclusive') {
    return exclusiveSubscriptions.includes(userSubscription);
  } else if (requiredTier === 'CapitalKV+') {
    return [...exclusiveSubscriptions, ...plusSubscriptions].includes(userSubscription);
  }

  return false;
};

const calculateCountdown = (currentTime: Date, targetTime: Date) => {
  if (targetTime <= currentTime) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      display: 'Available now',
      expired: true,
      total_seconds: 0
    };
  }

  const timeDiff = targetTime.getTime() - currentTime.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  // Format display string
  let display = '';
  if (days > 0) {
    display = `${days}d ${hours}h`;
  } else if (hours > 0) {
    display = `${hours}h ${minutes}m`;
  } else {
    display = `${minutes}m`;
  }

  return {
    days,
    hours,
    minutes,
    display,
    expired: false,
    total_seconds: Math.floor(timeDiff / 1000)
  };
};

export const shouldShowProduct = (
  product: Product,
  userSubscription?: string,
  isAdmin: boolean = false
): boolean => {
  if (isAdmin) return true; // Admins see all products

  const accessInfo = getProductAccessStatus(product, userSubscription);
  return accessInfo.accessStatus !== 'hidden';
};

export const canPurchaseProduct = (
  product: Product,
  userSubscription?: string
): boolean => {
  const accessInfo = getProductAccessStatus(product, userSubscription);
  return accessInfo.canPurchase;
};
