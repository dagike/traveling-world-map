import "./admin.css";

interface Props {
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function AdminBar({ isAdmin, onLoginClick, onLogout }: Props) {
  return (
    <div className="admin-bar">
      {isAdmin ? (
        <>
          <span className="dot">●</span> admin mode
          <button type="button" onClick={onLogout}>
            log out
          </button>
        </>
      ) : (
        <button type="button" onClick={onLoginClick}>
          admin log in
        </button>
      )}
    </div>
  );
}
