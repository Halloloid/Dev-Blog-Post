import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Landing from "./pages/Landing"
import PostView from "./pages/PostView"
import UserProfile from "./pages/UserProfile"

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/post/:id" element={<PostView/>}/>
        <Route path="/profile/:username" element={<UserProfile/>}/>
      </Routes>
    </>
  )
}

export default App
