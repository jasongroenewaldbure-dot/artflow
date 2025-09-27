import React from 'react'
import { Bell, Plus } from 'lucide-react'

const TopHeader: React.FC = () => {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: '240px', // Account for sidebar width
      right: 0,
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      zIndex: 5
    }}>
      {/* Right side actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Notifications */}
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Bell size={20} />
        </button>

        {/* Add/Create button */}
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#6e1fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a1ad6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6e1fff'
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </header>
  )
}

export default TopHeader
