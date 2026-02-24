import { useState } from "react";
import { FormField } from "../FormField";
import { Button } from "../Button";
import "./RegisterForm.css";
import { apiGetMe, apiRegister, type MeResponse } from "../../api/api";

type Props = {
  onSuccess: (me: MeResponse) => void;
};

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(username: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!username.trim()) errors.username = "Обязательное поле";
  else if (username.trim().length < 5) errors.username = "Минимум 5 символов";

  if (!email.trim()) errors.email = "Обязательное поле";
  else if (!emailRegex.test(email.trim())) errors.email = "Некорректный email";

  if (!password) errors.password = "Обязательное поле";
  else if (password.length < 8) errors.password = "Минимум 8 символов";

  return errors;
}

export const RegisterForm = ({ onSuccess }: Props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setServerError("");

    const nextErrors = validate(username, email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await apiRegister({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      const me = await apiGetMe();
      onSuccess(me);
    } catch (err) {
      clearForm();
      setErrors({});
      setServerError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <FormField label="Имя" errorMessage={errors.username}>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
          }}
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Email" errorMessage={errors.email}>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Пароль" errorMessage={errors.password}>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          disabled={isLoading}
        />
      </FormField>

      {serverError && (
        <div style={{ marginTop: 8, color: "crimson" }}>{serverError}</div>
      )}

      <Button type="submit" isLoading={isLoading}>
        Зарегистрироваться
      </Button>
    </form>
  );
};
