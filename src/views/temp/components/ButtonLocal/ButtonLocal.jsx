export default function ButtonLocal() {
    return (
        <button
            className="bg-red-500 cursor-pointer"
            onClick={() => {
                console.log("clicked local");
            }}
        >
            This is local button component
        </button>
    );
}
