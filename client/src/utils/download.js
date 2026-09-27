// Triggers a file save from an axios blob response (used for authenticated PDF downloads,
// since a plain <a href> or window.open() would not carry the Authorization header).
export function saveBlobResponse(blobResponse, filename) {
  const url = window.URL.createObjectURL(new Blob([blobResponse.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
