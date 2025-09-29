export function convertToIST(utcDateString: string): string {
  // Create a Date object from the UTC date string
  const utcDate = new Date(utcDateString);

  // Create options for formatting time in IST
  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata', // This is the timezone for Indian Standard Time
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // This will give you AM/PM format
  };

  // Convert to IST time string
  return utcDate.toLocaleTimeString('en-IN', istOptions);
}

// Usage example:
// In your React component:
// <TableCell>{convertToIST(item.PrintDate)}</TableCell>
