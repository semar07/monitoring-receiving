// Netlify Function: mengambil file xlsx Google Sheets (Publish to web) di sisi server,
// lalu meneruskannya ke dashboard dari domain yang sama (tidak kena blokir CORS, tanpa proxy pihak ketiga).
// Hanya mengambil SATU link yang diset di bawah / di environment variable SHEET_URL (bukan proxy terbuka).
const DEFAULT_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBfgYwWTp-ahBeiGyaXrTm_qxIGneAImhZwVRHFZEZjwFrG2mfE4Qfa0iJh5FHAE0BiIUilNXE5_fQ/pub?output=xlsx';

exports.handler = async () => {
  const url = process.env.SHEET_URL || DEFAULT_URL;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return { statusCode: 502, body: 'Google menjawab HTTP ' + res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
      return { statusCode: 502, body: 'Respons Google bukan file xlsx (cek Publish to web).' };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control': 'no-store'
      },
      body: buf.toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 502, body: 'Gagal mengambil data: ' + (e && e.message || e) };
  }
};
