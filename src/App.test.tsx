import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renderiza el título y el contador funciona', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /personal planner/i }),
    ).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /contador: 0/i })
    await user.click(button)
    expect(
      screen.getByRole('button', { name: /contador: 1/i }),
    ).toBeInTheDocument()
  })
})
