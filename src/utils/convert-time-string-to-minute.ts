export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number)

  return Number(hours) * 60 + Number(minutes)
}
