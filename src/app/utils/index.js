export const API_URL = 'https://backend-dms-lyart.vercel.app/'
export const headers = {
  'Content-Type': 'application/json',
}
// Modifikasi fungsi numberToWords untuk mendukung desimal
export const numberToWords = (num) => {
  if (num < 0 || isNaN(num)) return 'Nomor tidak valid';

  const numberToWord = (n) => {
    const words = [
      '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    ];
    const scales = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];
    if (n === 0) return 'Nol';

    let word = '';
    let scaleIndex = 0;

    while (n > 0) {
      const chunk = n % 1000;
      if (chunk > 0) {
        const hundreds = Math.floor(chunk / 100);
        const remainder = chunk % 100;

        const hundredsWord = hundreds > 0 ? `${words[hundreds]} Ratus ` : '';
        const tensWord =
          remainder >= 10 && remainder <= 19
            ? `${words[remainder]}`
            : remainder >= 20
            ? `${words[Math.floor(remainder / 10)]} Puluh ${words[remainder % 10]}`
            : `${words[remainder]}`;

        word = `${hundredsWord}${tensWord} ${scales[scaleIndex]} ${word}`;
      }
      n = Math.floor(n / 1000);
      scaleIndex++;
    }

    return word.trim();
  };

  const [integerPart, decimalPart] = num.toFixed(2).split('.').map(Number);

  const integerWords = numberToWord(integerPart);
  const decimalWords = decimalPart > 0 ? numberToWord(decimalPart) : '';

  return decimalWords
    ? `${integerWords} Koma ${decimalWords}`
    : `${integerWords} Rupiah`;
};


// Function to format numbers with thousands separatore
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID").format(amount);
}