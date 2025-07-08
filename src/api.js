import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getFriendlyErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unknown error occurred. Please try again.'
}

export async function testConnection(dbUrl) {
  try {
    const res = await api.post('/test-connection', { dbUrl })
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, message: getFriendlyErrorMessage(error) }
  }
}

export async function getSchema(dbUrl) {
  try {
    const res = await api.get('/get-schema', { params: { dbUrl } })
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, message: getFriendlyErrorMessage(error) }
  }
}

export async function getTables(dbUrl, tableSchema) {
  try {
    const res = await api.get('/get-tables', { params: { dbUrl, tableSchema } })
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, message: getFriendlyErrorMessage(error) }
  }
}

export async function getDiagramData(dbUrl, tableSchema, tableNames) {
  try {
    const res = await api.get('/get-diagram-data', { params: { dbUrl, tableSchema, tableNames } })
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, message: getFriendlyErrorMessage(error) }
  }
}