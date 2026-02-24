import "./App.css";
import { useEffect, useState } from "react";

import { AuthForm } from "./components/AuthForm";
import { UserView } from "./components/UserView";
import { NoteForm } from "./components/NoteForm";
import { NotesListView } from "./components/NotesListView";
import { PageSelector } from "./components/PageSelector";

import { apiCreateNote, apiGetMe, apiLogout } from "./api";
import type { MeResponse } from "./api";
import { useNotes } from "./hooks/useNotes";
import type { NoteFormValues } from "./validation/noteForm";

type AppStatus = "checking" | "guest" | "authed";

function App() {
  const [status, setStatus] = useState<AppStatus>("checking");
  const [user, setUser] = useState<MeResponse | null>(null);
  const [logoutError, setLogoutError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const notesReq = useNotes(currentPage, status === "authed");

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState<NoteFormValues | null>(null);

  useEffect(() => {
    let alive = true;

    apiGetMe()
      .then((me) => {
        if (!alive) return;
        setUser(me);
        setStatus("authed");
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
        setStatus("guest");
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleAuthSuccess = (me: MeResponse) => {
    setLogoutError("");
    setUser(me);
    setStatus("authed");
    setCurrentPage(1);
    setCreateError("");
    setCreateSuccess(null);
  };

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await apiLogout();
      setUser(null);
      setStatus("guest");
      setCurrentPage(1);

      notesReq.reset();
      setCreateError("");
      setCreateSuccess(null);
    } catch (e) {
      setUser(null);
      setStatus("guest");
      setCurrentPage(1);

      notesReq.reset();
      setCreateError("");
      setCreateSuccess(null);

      setLogoutError(e instanceof Error ? e.message : "Ошибка выхода");
    }
  };

  const handleCreateNote = async (values: NoteFormValues) => {
    setCreateError("");
    setCreateSuccess(null);
    setCreateLoading(true);

    try {
      await apiCreateNote(values);

      setCreateSuccess(values);

      await notesReq.run();

      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка создания заметки";
      setCreateError(msg);
      return { ok: false as const };
    } finally {
      setCreateLoading(false);
    }
  };

  const pageCount =
    notesReq.state.tag === "success" ? notesReq.state.data.pageCount : 1;

  const canSelectNext =
    notesReq.state.tag === "success" ? currentPage < pageCount : false;

  const noteFormIsLoading = createLoading;

  return (
    <div className="app">
      {status === "checking" && <div style={{ padding: 24 }}>Загрузка...</div>}

      {status === "guest" && <AuthForm onAuthSuccess={handleAuthSuccess} />}

      {status === "authed" && user && (
        <>
          <UserView user={user} onLogout={handleLogout} />

          {logoutError && (
            <div style={{ padding: 12, color: "crimson" }}>{logoutError}</div>
          )}

          <div style={{ paddingTop: 64 }}>
            <NoteForm
              onSubmit={handleCreateNote}
              isLoading={noteFormIsLoading}
              errorText={createError}
              successValues={createSuccess}
            />

            {notesReq.state.tag === "loading" && (
              <div style={{ padding: 12 }}>Загрузка заметок...</div>
            )}

            {notesReq.state.tag === "error" && (
              <div style={{ padding: 12, color: "crimson" }}>
                {notesReq.state.message}
              </div>
            )}

            {notesReq.state.tag === "success" && (
              <>
                <NotesListView notes={notesReq.state.data.list} />

                <PageSelector
                  currentPage={currentPage}
                  canSelectPrev={currentPage > 1}
                  canSelectNext={canSelectNext}
                  onPrevClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  onNextClick={() => setCurrentPage((p) => p + 1)}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
