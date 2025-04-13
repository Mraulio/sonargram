import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { UserProvider, UserContext } from './context/UserContext';

function App() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(''); // Crear usuario - Email
  const [userPassword, setUserPassword] = useState(''); // Crear usuario - Password
  const [loginEmail, setLoginEmail] = useState(''); // Login - Email
  const [loginPassword, setLoginPassword] = useState(''); // Login - Password
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [songs, setSongs] = useState('');
  const [creator, setCreator] = useState('');

  // Aquí ya no necesitas guardar el token y rol en el estado local de este componente
  const { token, role, login, logout } = useContext(UserContext);

  const [isReady, setIsReady] = useState(false);  // Flag de carga

  // Cargar usuarios
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  // Cargar listas
  useEffect(() => {
    axios.get('http://localhost:5000/api/lists')
      .then(res => setLists(res.data))
      .catch(err => console.error(err));
  }, []);

  // Este useEffect se ejecutará al recargar la página
  useEffect(() => {
    if (isReady) {
      if (token && role) {
        alert(`You are logged in! Role: ${role}, Token: ${token}`);
      } else {
        alert('You are not logged in');
      }
    }
  }, [isReady, token, role]);

  useEffect(() => {
    if (token && role) {
      setIsReady(true); // Marca el estado como listo para evitar el "parpadeo"
    }
  }, [token, role]);

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
        headers: { Authorization: `Bearer ${token}` }
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
        email: loginEmail, // Usar el email para login
        password: loginPassword // Usar la contraseña para login
      });

      const { token } = res.data;
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;  // Extraemos el rol del token

      login(token, userRole); // Usar el método de login del contexto
      alert(`Logged in successfully. Role: ${userRole}`);
    } catch (err) {
      alert('Error logging in');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();  // Llamamos a la función logout del contexto
    alert('Logged out successfully');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🔐 Login</h2>
      <input
        placeholder="Email"
        value={loginEmail} // Este es el email para login
        onChange={e => setLoginEmail(e.target.value)} // Solo actualiza el email de login
      />
      <input
        type="password"
        placeholder="Password"
        value={loginPassword} // Este es el password para login
        onChange={e => setLoginPassword(e.target.value)} // Solo actualiza la contraseña de login
      />
      <button onClick={loginUser}>Login</button>

      <button onClick={handleLogout}>Logout</button>

      {token && <p>Token: {token}</p>} {/* Mostrar el token cuando esté disponible */}

      <hr />
      
      {role === 'admin' && (  // Solo mostrar la sección si el rol es "admin"
        <>
          <h2>👤 Create User</h2>
          <input
            placeholder="Name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={userEmail} // Este es el email para crear usuario
            onChange={e => setUserEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={userPassword} // Este es el password para crear usuario
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
        </>
      )}


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
     
    </div>
  );
}

// Envuelve la aplicación con UserProvider para que todos los componentes puedan acceder al contexto
export default function AppWrapper() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
