import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography
} from '@mui/material';

function ProfileDialog({ open, onClose, user }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>個人資料</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary="用戶名"
              secondary={user?.username || '-'}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="電子郵件"
              secondary={user?.email || '-'}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="組織"
              secondary={user?.organization || '-'}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="國家/地區"
              secondary={`${user?.country || '-'} ${user?.province || ''} ${user?.city || ''}`}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileDialog; 