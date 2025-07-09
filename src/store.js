import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  step: 1,
  connectionType: 'url',
  formData: {
    dbUrl: '',
    databaseType: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  },
  testConnectionLoading: false,
  testConnectionSuccess: false,
  testConnectionError: null,
  schemaLoading: false,
  schemaSuccess: false,
  schemaError: null,
  schemas: [],
  selectedSchema: '',
  tablesLoading: false,
  tablesSuccess: false,
  tablesError: null,
  tables: [],
  selectedTables: [],
  diagramLoading: false,
  diagramError: null,
  diagramData: null
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload
    },
    setConnectionType(state, action) {
      state.connectionType = action.payload
    },
    setFormData(state, action) {
      state.formData = { ...state.formData, ...action.payload }
    },
    setTestConnectionLoading(state, action) {
      state.testConnectionLoading = action.payload
    },
    setTestConnectionSuccess(state, action) {
      state.testConnectionSuccess = action.payload
    },
    setTestConnectionError(state, action) {
      state.testConnectionError = action.payload
    },
    setSchemaLoading(state, action) {
      state.schemaLoading = action.payload
    },
    setSchemaSuccess(state, action) {
      state.schemaSuccess = action.payload
    },
    setSchemaError(state, action) {
      state.schemaError = action.payload
    },
    setSchemas(state, action) {
      state.schemas = action.payload
    },
    setSelectedSchema(state, action) {
      state.selectedSchema = action.payload
    },
    setTablesLoading(state, action) {
      state.tablesLoading = action.payload
    },
    setTablesSuccess(state, action) {
      state.tablesSuccess = action.payload
    },
    setTablesError(state, action) {
      state.tablesError = action.payload
    },
    setTables(state, action) {
      state.tables = action.payload
    },
    setSelectedTables(state, action) {
      state.selectedTables = action.payload
    },
    setDiagramLoading(state, action) {
      state.diagramLoading = action.payload
    },
    setDiagramError(state, action) {
      state.diagramError = action.payload
    },
    setDiagramData(state, action) {
      state.diagramData = action.payload
    },
    resetForm(state) {
      Object.assign(state, initialState)
    }
  }
})

export const {
  setStep,
  setConnectionType,
  setFormData,
  setTestConnectionLoading,
  setTestConnectionSuccess,
  setTestConnectionError,
  setSchemaLoading,
  setSchemaSuccess,
  setSchemaError,
  setSchemas,
  setSelectedSchema,
  setTablesLoading,
  setTablesSuccess,
  setTablesError,
  setTables,
  setSelectedTables,
  setDiagramLoading,
  setDiagramError,
  setDiagramData,
  resetForm
} = formSlice.actions

const store = configureStore({
  reducer: {
    form: formSlice.reducer
  }
})

export default store