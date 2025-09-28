import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../marketplace/Header'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
        {children || <Outlet />}
      </main>
    </div>
  )
}

export default DashboardLayout
