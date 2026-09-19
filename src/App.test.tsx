import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('muestra las instrucciones de configuración sin credenciales de Supabase', async () => {
    render(<App />)
    expect(
      await screen.findByText(/configuración de supabase pendiente/i),
    ).toBeInTheDocument()
  })
})
