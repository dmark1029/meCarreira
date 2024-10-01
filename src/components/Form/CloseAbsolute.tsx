import { Close } from '@mui/icons-material'
import React from 'react'

interface Props {
  onClose: () => void
  visible?: boolean
}

const CloseAbsolute: React.FC<Props> = ({ onClose, visible = false }) => {
  if (!visible) {
    return
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        scale: '1.2',
      }}
      className="pointer"
    >
      <Close
        style={{
          color: 'white',
        }}
        className="icon-color-search gray"
      />
      <span
        style={{
          color: 'white',
        }}
      >
        Close
      </span>
    </div>
  )
}

export default CloseAbsolute
