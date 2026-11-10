/** Money is an integer in rupees. Always format it through here. */
export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-US')}`;
}
