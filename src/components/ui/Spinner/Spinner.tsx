import "./Spinner.css";

interface SpinnerProps {
    size?: number;
    color?: string;
    text?: string;
}

function Spinner({ size = 20, color = "#fff", text = "..." }: SpinnerProps) {
    return (
        <div className="spinner-wrapper">
            <div
                className="spinner"
                style={{
                    width: size,
                    height: size,
                    borderColor: `${color} transparent transparent transparent`,
                }}
            />
            <span className="spinner-text" style={{ color: color }}>{text}</span>
        </div>
    );
}

export default Spinner;