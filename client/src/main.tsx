import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { store } from './store/store'
import AuthInitializer from './components/AuthInitializer'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <App />
          <Toaster position="top-center" richColors />
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)