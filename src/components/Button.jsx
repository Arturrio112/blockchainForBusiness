export default function Button() {
    return (
        <button
            className="bg-blue-500 cursor-pointer"
            onClick={() => {
                console.log("clicked shared");
            }}
        >
            This is shared button component
        </button>
    );
}
