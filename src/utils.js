export function connectionStringGenerator({ databaseType, host, port, database, username, password }) {
  if (databaseType !== 'postgresql') {
    throw new Error('Only PostgreSQL is supported for connection string generation.')
  }
  if (!host || !port || !database || !username) {
    throw new Error('Missing required fields for connection string generation.')
  }
  // If password is empty, omit it from the string
  const auth = password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}` : encodeURIComponent(username)
  return `postgresql://${auth}@${host}:${port}/${database}`
}