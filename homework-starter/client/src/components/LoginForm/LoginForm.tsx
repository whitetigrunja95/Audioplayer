import { useState } from "react";
import "./LoginForm.css";
import { FormField } from "../FormField";
import { Button } from "../Button";
import { apiGetMe, apiLogin, type MeResponse } from "../../api/api";

type Props = {
  onSuccess: (me: MeResponse) => void;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) errors.email = "Обязательное поле";
  else if (email.trim().length < 5) errors.email = "Минимум 5 символов";

  if (!password) errors.password = "Обязательное поле";
  else if (password.length < 8) errors.password = "Минимум 8 символов";

  return errors;
}

export const LoginForm = ({ onSuccess }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setServerError("");

    const nextErrors = validate(email, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await apiLogin({ email: email.trim(), password });
      const me = await apiGetMe();
      onSuccess(me);
    } catch (err) {
      clearForm();
      setErrors({});
      setServerError(err instanceof Error ? err.message : "Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
        Войти
      </Button>
    </form>
  );
};
