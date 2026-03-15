import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Landing from "./pages/Landing"
import PostView from "./pages/PostView"
import UserProfile from "./pages/UserProfile"
import Followings from "./pages/Followings"
import Followers from "./pages/Followers"
import CreatePost from "./pages/CreatePost"

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/post/:id" element={<PostView/>}/>
        <Route path="/profile/:username" element={<UserProfile/>}/>
        <Route path="/profile/:username/following" element={<Followings/>}/>
        <Route path="/profile/:username/followers" element={<Followers/>}/>
        <Route path="/createpost/:username" element={<CreatePost/>}/>
      </Routes>
    </>
  )
}

export default App
