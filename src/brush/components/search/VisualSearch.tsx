import React, { useState } from 'react'
import { Card } from '../Card'
import { Button } from '../Button'
import { Typography } from '../Typography'
import { tokens } from '../../palette-tokens'

interface VisualSearchProps {
  onSearch?: (image: File) => void
  onResults?: (results: unknown[]) => void
  className?: string
}

const VisualSearch: React.FC<VisualSearchProps> = ({
  onSearch,
  // onResults,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onSearch?.(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onSearch?.(file)
    }
  }

  return (
    <div className={`visual-search ${className}`}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
        Visual Search
      </Typography>
      
      <Card
        variant="outlined"
        padding="lg"
        style={{
          border: dragActive ? `2px dashed ${tokens.colors.purple100}` : `2px dashed ${tokens.colors.border.primary}`,
          backgroundColor: dragActive ? tokens.colors.purple10 : tokens.colors.white100,
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="visual-search-input"
        />
        
        <label htmlFor="visual-search-input" style={{ cursor: 'pointer', width: '100%' }}>
          {selectedFile ? (
            <div>
              <Typography variant="body" style={{ marginBottom: tokens.spacing.sm }}>
                Selected: {selectedFile.name}
              </Typography>
              <Button variant="primary" onClick={() => onSearch?.(selectedFile)}>
                Search Similar Artworks
              </Button>
            </div>
          ) : (
            <div>
              <Typography variant="body" style={{ marginBottom: tokens.spacing.sm }}>
                Drag and drop an image here, or click to select
              </Typography>
              <Button variant="secondary">
                Choose Image
              </Button>
            </div>
          )}
        </label>
      </Card>
    </div>
  )
}

export default VisualSearch
