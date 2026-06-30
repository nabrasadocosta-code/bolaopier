/**
 * Generates a valid static PIX payload according to EMV BR Code standards.
 * Allows the user to scan the QR Code or copy/paste the string directly into their bank.
 */
export function generatePixPayload(key: string, name: string, city: string, amount?: number): string {
  const cleanKey = key.trim();
  // Strip accents and limit lengths as per PIX spec
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, 25);
  const cleanCity = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, 15);
  
  const formatField = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const keyField = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `0014br.gov.bcb.pix${keyField}`);
  const merchantCategory = '52040000';
  const transactionCurrency = '5303986';
  
  let amountStr = '';
  if (amount && amount > 0) {
    amountStr = formatField('54', amount.toFixed(2));
  }
  
  const countryCode = '5802BR';
  const merchantName = formatField('59', cleanName);
  const merchantCity = formatField('60', cleanCity);
  const additionalData = formatField('62', formatField('05', 'BOLAOCOPA'));
  
  const payload = `000201${merchantAccountInfo}${merchantCategory}${transactionCurrency}${amountStr}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;
  
  // CRC16 CCITT Calculation
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i);
    let x = ((crc >> 8) ^ charCode) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  const crcStr = crc.toString(16).toUpperCase().padStart(4, '0');
  
  return payload + crcStr;
}

/**
 * Formats an ISO Date string into friendly Brazilian format.
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Gets a friendly relative time label or formatted time.
 */
export function getFriendlyTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // Check if same day
    if (date.toDateString() === now.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Amanhã às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}
