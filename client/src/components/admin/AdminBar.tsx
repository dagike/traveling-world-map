import "./admin.css";

interface Props {
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onAddCountry: () => void;
}

export function AdminBar({ isAdmin, onLoginClick, onLogout, onAddCountry }: Props) {
  return (
    <div className="admin-bar">
      {isAdmin ? (
        <>
          <span className="dot">●</span> admin mode
          <button type="button" onClick={onAddCountry}>
            + country
          </button>
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
