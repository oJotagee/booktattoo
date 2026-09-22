export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length > 11) {
    return phone.slice(0, 15);
  }

  const formattedPhone = cleaned
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2');

  return formattedPhone;
}

export function extractPhoneNumber(phone: string) {
  const phoneValue = phone.replace(/[\(\)\s-]/g, '');

  return phoneValue;
}
