export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number)

  if (hours && minutes) return hours * 60 + minutes

  if (minutes) return minutes

  return 0
}
