import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Canvas from "./pages/Canvas";

const paths = [
    {
        path: '/',
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
