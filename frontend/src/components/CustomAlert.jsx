import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const CustomAlert = ({ 
  open, 
  message, 
  type = 'info', 
  onClose, 
  onConfirm 
}) => {
  const isConfirm = type === 'confirm';
  const confirmButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const handleConfirm = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onConfirm();
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (isConfirm) {
          confirmButtonRef.current?.focus();
        } else {
          closeButtonRef.current?.focus();
        }
      }, 0);
    }
  }, [open, isConfirm]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disablePortal
      keepMounted
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      PaperProps={{
        sx: { 
          minWidth: '300px',
          '& .MuiDialog-paper': {
            margin: 0
          }
        }
      }}
    >
      <DialogTitle id="alert-dialog-title">
        {type === 'success' && '成功'}
        {type === 'error' && '錯誤'}
        {type === 'warning' && '警告'}
        {type === 'info' && '提示'}
        {type === 'confirm' && '確認'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {isConfirm ? (
          <>
            <Button 
              ref={closeButtonRef}
              onClick={handleClose} 
              color="primary"
              tabIndex={1}
            >
              取消
            </Button>
            <Button 
              ref={confirmButtonRef}
              onClick={handleConfirm}
              color="primary" 
              tabIndex={2}
            >
              確定
            </Button>
          </>
        ) : (
          <Button 
            ref={closeButtonRef}
            onClick={handleClose} 
            color="primary"
            tabIndex={1}
          >
            確定
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomAlert; 