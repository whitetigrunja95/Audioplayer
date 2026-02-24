import { useState } from "react";
import { LoginForm } from "../LoginForm";
import { RegisterForm } from "../RegisterForm";
import type { MeResponse } from "../../api/api";

import "./AuthForm.css";

type Props = {
  onAuthSuccess: (me: MeResponse) => void;
};

export const AuthForm = ({ onAuthSuccess }: Props) => {
  const [authType, setAuthType] = useState<"register" | "auth">("register");

  const handleClick = () => {
    setAuthType((prev) => (prev === "register" ? "auth" : "register"));
  };

  return (
    <div className="auth-form">
      <p className="auth-form__title">
        {authType === "register" ? "Регистрация" : "Авторизация"}
      </p>

      {authType === "register" ? (
        <RegisterForm onSuccess={onAuthSuccess} />
      ) : (
        <LoginForm onSuccess={onAuthSuccess} />
      )}

      <div className="auth-form__info">
        <span>
          {authType === "register" ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"}
        </span>
        <button className="auth-form__button" type="button" onClick={handleClick}>
          {authType === "register" ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
};
