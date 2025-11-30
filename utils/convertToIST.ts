export function convertToIST(utcDateString: string): string {
  const utcDate = new Date(utcDateString);

  const istOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  return utcDate.toLocaleTimeString('en-IN', istOptions);
}
