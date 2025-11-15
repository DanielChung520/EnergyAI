import './shim';
// 临时注释Service Worker注册代码
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     if (process.env.NODE_ENV === 'production') {
//       navigator.serviceWorker
//         .register('/sw.js')
//         .catch(error => {
//           console.log('SW registration failed:', error);
//         });
//     }
//   });
// } 