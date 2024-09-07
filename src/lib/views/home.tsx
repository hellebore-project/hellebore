import { observer } from "mobx-react-lite";

function renderHome() {
    return (
        <div className="container">
            <h1>Home</h1>
        </div>
    );
}

export const Home = observer(renderHome);
