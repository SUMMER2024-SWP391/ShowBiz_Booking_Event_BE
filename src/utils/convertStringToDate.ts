export function createDateFromString(dateString: string) {
  const [day, month, year] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date
}
// vd: createDateFromString('23-05-2024') => Date('2024-05-23T00:00:00.000Z')

export function convertTime(input: string): string {
  // Regex để kiểm tra và phân tích cú pháp thời gian đầu vào
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

  // Kiểm tra xem đầu vào có khớp với regex không
  const match = input.match(regex);

  if (!match) {
    throw new Error("Invalid time format");
  }

  let hours: number = parseInt(match[1], 10);
  let minutes: number = parseInt(match[2], 10);

  // Xác định AM hoặc PM
  const period: string = hours >= 12 ? 'PM' : 'AM';

  // Chuyển đổi giờ từ định dạng 24 giờ sang định dạng 12 giờ
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // Nếu giờ là 0 thì chuyển thành 12 (12 AM hoặc 12 PM)

  // Định dạng phút thành chuỗi có độ dài 2 (ví dụ: "4:5" thành "4:05")
  const minutesStr: string = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours}:${minutesStr} ${period}`;
}

// Ví dụ sử dụng
console.log(convertTime("16:30")); // "4:30 PM"
console.log(convertTime("06:00")); // "6:00 AM"
console.log(convertTime("00:00")); // "12:00 AM"
console.log(convertTime("12:00")); // "12:00 PM"
