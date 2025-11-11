import Button from "../../components/Button";
import ButtonLocal from "./components/ButtonLocal/ButtonLocal";

export default function Temp() {
    return (
        <div className="flex items-center gap-4 p-4">
            <h1>Welcome to the Temp Page!</h1>
            <Button />
            <ButtonLocal />
        </div>
    );
}
