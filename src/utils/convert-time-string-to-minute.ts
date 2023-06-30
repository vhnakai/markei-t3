/* eslint-disable @typescript-eslint/restrict-plus-operands */
export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number)

  return hours * 60 + minutes
}
