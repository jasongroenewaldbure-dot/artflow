import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../navigation/Sidebar'
import TopHeader from '../navigation/TopHeader'

const LoggedInLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div style={{
        flex: 1,
        marginLeft: '240px', // Account for sidebar width
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <TopHeader />
        
        {/* Main content */}
        <main style={{
          flex: 1,
          marginTop: '64px', // Account for header height
          padding: '24px',
          backgroundColor: '#ffffff'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LoggedInLayout
