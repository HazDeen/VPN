import { Toaster, toast } from 'sonner';

export const Toast = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        className: 'toast',
        style: {
          background: '#1a1c22',
          color: '#fff',
          border: '2px solid rgba(255, 77, 77, 0.5)',
          borderRadius: '20px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        },
      }}
      icons={{
        success: <span style={{ color: '#34C759', marginRight: '8px' }}>✅</span>,
        error: <span style={{ color: '#FF4D4D', marginRight: '8px' }}>❌</span>,
        loading: <span style={{ color: '#FF9F0A', marginRight: '8px' }}>⏳</span>,
        info: <span style={{ color: '#3390FF', marginRight: '8px' }}>ℹ️</span>,
        warning: <span style={{ color: '#FF9F0A', marginRight: '8px' }}>⚠️</span>,
      }}
    />
  );
};

export { toast };