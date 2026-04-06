export const fetchTransactions = async (fallbackData) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 900)
  })
  return fallbackData
}
