export function createDateFromString(dateString: string) {
  const [day, month, year] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date
}
// vd: createDateFromString('23-05-2024') => Date('2024-05-23T00:00:00.000Z')
