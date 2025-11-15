import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('圖表錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ff4d4f'
        }}>
          <h3>圖表載入失敗</h3>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#1890ff',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            重試
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 