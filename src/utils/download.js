// src/utils/download.js
import api from '../api/api.js';

/**
 * Download invoice PDF for a paymentId.
 * Returns true on success.
 */
export async function downloadInvoice(paymentId) {
  const res = await api.get(`/api/payments/${paymentId}/invoice`, {
    responseType: 'blob',
  });

  // parse filename
  const contentDisp = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
  let filename = `${paymentId}-invoice.pdf`;
  const match = /filename\*?=(?:UTF-8''|")?([^;"']+)/i.exec(contentDisp);
  if (match && match[1]) {
    filename = decodeURIComponent(match[1]);
  }

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return true;
}
