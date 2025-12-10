import {createContext, useContext, useEffect, useState } from "react";
export const useAuth = () => useContext(AuthContext);
export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // restoring user on refresh
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        // save tokens
        localStorage.setItem("access_token",data.access);
        localStorage.setItem("refresh_token",data.refresh);
        
        // store user role 
        // localStorage.setItem("user_role",data.user_role);

        // store full user object
        const userdata = {
            id:data.id,
            username:data.username,
            role:data.user_role,
        };

        localStorage.setItem('user',JSON.stringify(userdata));

        // update react state
        setUser(userdata);
    };
    
    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // localStorage.removeItem("user_role");
        localStorage.removeItem("user");
        setUser(null);
    };

    if (loading) 
        return <div>Loading...</div>;

    return (
        <AuthContext.Provider value = {{ user, login, logout,loading}}>
            {children}
        </AuthContext.Provider>
    );
};