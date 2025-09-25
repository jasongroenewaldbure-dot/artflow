import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../marketplace/Header'

const DashboardLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <main style={{
        flex: 1,
        padding: 'var(--space-lg)',
        maxWidth: 'var(--container-xl)',
        margin: '0 auto',
        width: '100%'
      }}>
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
