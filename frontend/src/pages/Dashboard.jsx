import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [songs, setSongs] = useState('');
  const [creator, setCreator] = useState('');
  const { mode, toggleTheme } = useContext(ThemeContext);

  const { token, role, login, logout } = useContext(UserContext);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/lists')
      .then(res => setLists(res.data))
      .catch(err => console.error(err));
  }, []);

  const createUser = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name: userName,
        email: userEmail,
        password: userPassword
      });
      setUsers([...users, res.data]);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
    } catch (err) {
      alert('Error creating user');
      console.error(err);
    }
  };

  const createList = async () => {
    try {
      const songArray = songs.split(',').map(s => s.trim());
      await axios.post('http://localhost:5000/api/lists', {
        name: listName,
        songs: songArray,
        creator
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('List created');
      setListName('');
      setSongs('');
    } catch (err) {
      alert('Error creating list');
    }
  };

  return (
    <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: 600, mx: 'auto' }}>

      {/* Estado de sesión */}
      <Card sx={{ mb: 4, backgroundColor: token ? '#e8f5e9' : '#ffebee', border: '1px solid', borderColor: token ? 'green' : 'red' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: token ? 'green' : 'red' }}>
            {token ? `🟢 Usuario logueado (Rol: ${role})` : '🔴 No hay ningún usuario logueado'}
          </Typography>
          {token && (
            <Button variant="outlined" onClick={logout} sx={{ mt: 1 }}>
              Logout
            </Button>
          )}
        </CardContent>
      </Card>     
      <div>
      <Button variant="outlined" onClick={toggleTheme}>
        Cambiar a modo {mode === 'light' ? 'oscuro' : 'claro'}
      </Button>
      {/* ... resto del contenido */}
    </div>
      {role === 'admin' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>👤 Create User</Typography>
            <TextField
              fullWidth
              label="Name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
              margin="normal"
            />
            <Button variant="contained" onClick={createUser} sx={{ mt: 2 }}>
              Create User
            </Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Existing Users</Typography>
            <ul>
              {users.map(u => (
                <li key={u._id}>{u.name} ({u.email})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>🎵 Create List</Typography>
          <TextField
            fullWidth
            label="List Name"
            value={listName}
            onChange={e => setListName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Song IDs (comma-separated)"
            value={songs}
            onChange={e => setSongs(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Creator</InputLabel>
            <Select
              value={creator}
              label="Creator"
              onChange={e => setCreator(e.target.value)}
            >
              <MenuItem value="">Select a creator</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={createList} sx={{ mt: 2 }}>
            Create List
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Existing Lists</Typography>
          <ul>
            {lists.map(l => (
              <li key={l._id}>{l.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {token && (
        <Typography sx={{ mt: 4 }} fontSize="small" color="text.secondary">
          Token: {token}
        </Typography>
      )}
    </Box>
  );
}

export default Dashboard;
