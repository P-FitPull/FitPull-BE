// 이름 마스킹
export function maskName(name) {
  if (!name) return '';
  if (name.length <= 1) return '*';
  return name[0] + '*'.repeat(name.length - 1);
}

// 이메일 마스킹 (앞 5글자만 노출)
export function maskEmail(email) {
  if (!email) return '';
  const [id, domain] = email.split('@');
  if (id.length <= 3) return '*'.repeat(id.length) + '@' + domain;
  return id.slice(0, 5) + '*'.repeat(id.length - 5) + '@' + domain;
}
