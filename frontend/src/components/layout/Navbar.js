import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul>
      <li>
        <span style={{ marginRight: '1rem' }}>
            Hi, {auth.user?.username} ({auth.user?.role})
        </span>
      </li>
      <li>
        <button onClick={onLogout}>
          Logout
        </button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login / Register</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        AdaptiveLearn
      </Link>
      <nav>{auth.user ? authLinks : guestLinks}</nav>
    </nav>
  );
};

export default Navbar;