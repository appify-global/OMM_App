/** Display like +61 *** *** 15 589 for demo numbers. */
export function maskPhoneForDisplay(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length < 6) return phone;
  const tail = d.slice(-5);
  const a = tail.slice(0, 2);
  const b = tail.slice(2);
  return `+61 *** *** ${a} ${b}`;
}
