import TextEditor from "./TextEditor";
import {v4 as uuidV4} from 'uuid';
import {
  BrowserRouter as Router,
  Routes ,
  Route,
  Navigate as Redirect 
} from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Redirect replace to={`/documents/${uuidV4()}`} />} />
        <Route path="/documents/:id"  element={<TextEditor/>}/>
      </Routes>
    </Router>
  );
}

export default App;
