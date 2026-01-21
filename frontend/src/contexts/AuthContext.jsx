// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // 토큰이 유효하지 않으면 로그아웃
          logout();
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Google 로그인
  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential })
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  };

  // 로그아웃
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // API 키 저장
  const saveApiKey = async (service, apiKey) => {
    try {
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service, apiKey })
      });

      if (!response.ok) {
        throw new Error('API 키 저장 실패');
      }

      const data = await response.json();
      setUser(prev => ({ ...prev, apiKeyStatus: data.apiKeyStatus }));
      return data;
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      throw error;
    }
  };

  // API 키 삭제
  const deleteApiKey = async (service) => {
    try {
      const response = await fetch(`/api/auth/api-keys/${service}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('API 키 삭제 실패');
      }

      const data = await response.json();
      setUser(prev => ({ ...prev, apiKeyStatus: data.apiKeyStatus }));
      return data;
    } catch (error) {
      console.error('API 키 삭제 오류:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    saveApiKey,
    deleteApiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
