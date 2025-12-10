import { useContext } from "react";
import {Navigate} from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function PrivateRoute ({children,role}) {
    const {user,loading} = useContext(AuthContext);

    console.log("user in private route:",user);

    // if user objects is undefined 

    if (loading) {
        return <div>Loading...</div>
    }

    // if user not logged in 
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    // role protection
    if (role && user.role !== role) {
        return <Navigate to="/" replace/>;
    }
    return children;

}
    
