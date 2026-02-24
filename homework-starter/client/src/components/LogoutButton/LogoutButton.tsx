import { Button } from "../Button";
import "./LogoutButton.css";

export const LogoutButton = () => {
  return (
    <div className="logout-button">
      <Button kind="secondary">Выйти</Button>
    </div>
  );
};
