function AvatarGroup({ avatars, maxVisible = 3 }) {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`Avatar ${index + 1}`}
          className={`w-8 h-8 rounded-full border-2 border-white -ml-2 ${
            index > 0 ? "z-10" : ""
          }`}
        />
      ))}
      {avatars.length > maxVisible && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700 -ml-2">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
}

export default AvatarGroup;
