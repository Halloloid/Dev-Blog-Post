import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Landing from "./pages/Landing"
import PostView from "./pages/PostView"

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/post/:id" element={<PostView/>}/>
      </Routes>
    </>
  )
}

export default App