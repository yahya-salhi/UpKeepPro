function UserStatus({ isOnline }) {
  return (
    <span className={`badge ${isOnline ? "badge-success" : "badge-error"}`}>
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

export default UserStatus;
