export function convertToIST(isoDateStr:Date) {
  const date = new Date(isoDateStr);

  // Convert to IST by adding 5 hours 30 minutes offset
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
  const istDate = new Date(date.getTime() + istOffset);

  // Format the date
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  } as const;

  return istDate.toLocaleString("en-IN", options);
}
