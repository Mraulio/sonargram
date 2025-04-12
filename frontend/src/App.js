import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [songs, setSongs] = useState('');
  const [creator, setCreator] = useState('');
  const [token, setToken] = useState('');  // Para almacenar el token JWT

  // Load users
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  // Load lists
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
      const res = await axios.post('http://localhost:5000/api/lists', {
        name: listName,
        songs: songArray,
        creator
      }, {
        headers: { Authorization: `Bearer ${token}` }  // Enviar el token en los headers
      });
      alert('List created');
      setListName('');
      setSongs('');
    } catch (err) {
      alert('Error creating list');
    }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email: userEmail,
        password: userPassword
      });
      setToken(res.data.token);  // Guardar el token en el estado
      alert('Logged in successfully');
    } catch (err) {
      alert('Error logging in');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>👤 Create User</h2>
      <input
        placeholder="Name"
        value={userName}
        onChange={e => setUserName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={userEmail}
        onChange={e => setUserEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={userPassword}
        onChange={e => setUserPassword(e.target.value)}
      />
      <button onClick={createUser}>Create User</button>

      <h3>Existing Users:</h3>
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.name} ({u.email})</li>
        ))}
      </ul>

      <hr />

      <h2>🎵 Create List</h2>
      <input
        placeholder="List name"
        value={listName}
        onChange={e => setListName(e.target.value)}
      />
      <input
        placeholder="Song IDs (comma-separated)"
        value={songs}
        onChange={e => setSongs(e.target.value)}
      />
      <select value={creator} onChange={e => setCreator(e.target.value)}>
        <option value="">Select a creator</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>
      <button onClick={createList}>Create List</button>

      <h3>Existing Lists:</h3>
      <ul>
        {lists.map(l => (
          <li key={l._id}>{l.name}</li>
        ))}
      </ul>

      <hr />

      <h2>🔐 Login</h2>
      <input
        placeholder="Email"
        value={userEmail}
        onChange={e => setUserEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={userPassword}
        onChange={e => setUserPassword(e.target.value)}
      />
      <button onClick={loginUser}>Login</button>

      {token && <p>Token: {token}</p>} {/* Mostrar el token cuando esté disponible */}
    </div>
  );
}

export default App;
