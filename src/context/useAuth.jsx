// src/context/useAuth.jsx

import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx'; // 從 AuthContext.jsx 中匯入 AuthContext

export const useAuth = () => useContext(AuthContext);

