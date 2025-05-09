function Button({ bgColor, color, size, text, borderRadius }) {
  return (
    <button
      type="button"
      style={{ backgroundColor: bgColor, color, borderRadius }}
      className={`text-${size} p-3 hover:drop-shadow-xl hover:bg-${bgColor}`}
    >
      {text}
    </button>
  );
}

export default Button;
