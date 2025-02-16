import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Canvas from "./pages/Canvas";
import Calculator from './pages/Calculator';

const paths = [
    {
        path: '/',
        element: (
            <Calculator />
        ),
    },
    {
        path: '/canvas',
        element: (
            <Canvas />
        ),
    },
];

const BrowserRouter = createBrowserRouter(paths);

function App() {
    return (
        <>
            <RouterProvider router={BrowserRouter} />
        </>
    );
}

export default App;
