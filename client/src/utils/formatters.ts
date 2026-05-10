/**
 * Shared formatting utilities to avoid code duplication
 */

export const formatCurrency = (amount: number, currency: string, hideBalance: boolean = false) => {
  if (hideBalance) {
    return "••••••";
  }

  const curr = currency || "USD";
  const locales: Record<string, string> = {
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE",
    CAD: "en-CA",
    AUD: "en-AU",
    CHF: "de-CH",
    JPY: "ja-JP",
  };

  try {
    return new Intl.NumberFormat(locales[curr as keyof typeof locales] || "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${curr}`;
  }
};

export const formatCurrencyNoDecimals = (
  amount: number,
  currency: string,
  hideBalance: boolean = false
) => {
  if (hideBalance) {
    return "••••••";
  }

  const curr = currency || "USD";
  const locales: Record<string, string> = {
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE",
    CAD: "en-CA",
    AUD: "en-AU",
    CHF: "de-CH",
    JPY: "ja-JP",
  };

  try {
    return new Intl.NumberFormat(locales[curr as keyof typeof locales] || "en-US", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(0)} ${curr}`;
  }
};

export const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export const formatGroupDate = (date: Date | string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
