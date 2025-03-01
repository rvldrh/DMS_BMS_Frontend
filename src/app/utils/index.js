export const API_URL = 'https://backend-dms-lyart.vercel.app/api/'
export const headers = {
  'Content-Type': 'application/json',
}
// Modifikasi fungsi numberToWords untuk mendukung desimal
export const numberToWords = (num) => {
  if (isNaN(num) || num < 0) return "Nomor tidak valid";

  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
  const belasan = ["Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas"];
  const puluhan = ["", "", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh", "Enam Puluh", "Tujuh Puluh", "Delapan Puluh", "Sembilan Puluh"];
  const ribuan = ["", "Ribu", "Juta", "Miliar", "Triliun"];

  const convertThreeDigits = (n) => {
    let result = "";

    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundreds > 0) {
      result += (hundreds === 1 ? "Seratus" : satuan[hundreds] + " Ratus") + " ";
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += satuan[remainder];
      } else if (remainder < 20) {
        result += belasan[remainder - 10];
      } else {
        result += puluhan[Math.floor(remainder / 10)] + " " + satuan[remainder % 10];
      }
    }

    return result.trim();
  };

  if (num === 0) return "Nol Rupiah";

  let integerPart = Math.floor(num);
  let decimalPart = Math.round((num - integerPart) * 100);
  let words = "";
  let scaleIndex = 0;

  while (integerPart > 0) {
    let chunk = integerPart % 1000;
    if (chunk > 0) {
      let chunkWords = convertThreeDigits(chunk);
      if (scaleIndex === 1 && chunk === 1) {
        chunkWords = "Seribu";
      }
      words = chunkWords + " " + ribuan[scaleIndex] + " " + words;
    }
    integerPart = Math.floor(integerPart / 1000);
    scaleIndex++;
  }

  words = words.trim() + " Rupiah";

  if (decimalPart > 0) {
    words += " Koma " + convertThreeDigits(decimalPart);
  }

  return words.trim();
};



// Function to format numbers with thousands separatore
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID").format(amount);
}