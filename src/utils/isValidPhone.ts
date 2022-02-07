export default function isValidPhone(phone: any): boolean {
  phone = phone.toString();
  return (phone[0] === "7" && isFinite(Number(phone)) && phone.length === 11);
}