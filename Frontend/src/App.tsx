import { useEffect, useState } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Landing from "./pages/Landing"
import PostView from "./pages/PostView"
import UserProfile from "./pages/UserProfile"
import Followings from "./pages/Followings"
import Followers from "./pages/Followers"
import CreatePost from "./pages/CreatePost"
import UpdatePost from "./pages/UpdatePost"
import api from "./config/api"
import UsernameSetupModal from "./components/UsernameSetupModal"
import AppNavbar from "./components/AppNavbar"

type AuthUser = {
  id: string;
  full_name: string;
  avatar_url: string;
  user_name: string | null;
};

const App = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const location = useLocation();
  const pathname = location.pathname;
  const showNavbar =
    pathname !== "/" &&
    !pathname.startsWith("/createpost") &&
    !pathname.endsWith("/edit");

  useEffect(() => {
    let isMounted = true;

    const fetchAuthUser = async () => {
      try {
        const response = await api.get("/auth/me", { withCredentials: true });
        if (!isMounted) return;

        const user = response.data as AuthUser | null;
        setAuthUser(user);
        setShowUsernameModal(Boolean(user && !user.user_name));
      } catch {
        if (!isMounted) return;
        setAuthUser(null);
        setShowUsernameModal(false);
      }
    };

    fetchAuthUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ ["--app-navbar-height" as string]: `${showNavbar ? navbarHeight : 0}px` }}>
      {showUsernameModal && authUser && (
        <UsernameSetupModal
          onSuccess={(username) => {
            setAuthUser((prev) => (prev ? { ...prev, user_name: username } : prev));
            setShowUsernameModal(false);
            window.dispatchEvent(new Event("username-created"));
          }}
        />
      )}
      {showNavbar && <AppNavbar user={authUser} onHeightChange={setNavbarHeight} />}
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/post/:id" element={<PostView/>}/>
        <Route path="/profile/:username" element={<UserProfile/>}/>
        <Route path="/profile/:username/following" element={<Followings/>}/>
        <Route path="/profile/:username/followers" element={<Followers/>}/>
        <Route path="/createpost/:username" element={<CreatePost/>}/>
        <Route path="/profile/:username/posts/:id/edit" element={<UpdatePost/>}/>
      </Routes>
    </div>
  )
}

export default App
