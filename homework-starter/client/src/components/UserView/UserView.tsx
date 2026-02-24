import "./UserView.css";
import type { MeResponse } from "../../api/api";

type Props = {
  user: MeResponse;
  onLogout: () => void;
};

export const UserView = ({ user, onLogout }: Props) => {
  const username = user.username || user.email;

  return (
    <div className="user-view">
      <div className="user-view__left">
        <div className="user-view__logo">
          {username.slice(0, 1).toUpperCase()}
        </div>
        <span className="user-view__name">{username}</span>
      </div>

      <button className="user-view__logout" type="button" onClick={onLogout}>
        Выйти
      </button>
    </div>
  );
};
