export default function getToken() {
  const name = "jwtToken";
  const regex = new RegExp(`(^| )${name}=([^;]+)`);
  const match = document.cookie.match(regex);
  if (match) {
    return match[2];
  }
  return null;
}
