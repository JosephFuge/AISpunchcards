import { useTranslation } from "react-i18next";
import "../css/styles.css";
// import "../css/home.css";
import { useContext } from "react";
import { FirebaseContext } from "./firebaseProvider";
import { NavLink } from "react-router-dom";

export function Header() {
  const { t, i18n } = useTranslation();
  const fireContext = useContext(FirebaseContext);

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <>
      <nav>
        <div className="nav-links">
          {fireContext != null && fireContext.isAuthenticated && fireContext.user != null ? (
            <input
              id="signOutBtn"
              className="ais-button background-ais"
              type="button"
              onClick={async () => {
                await fireContext?.userSignOut();
              }}
              value={t("sign_out") as string}
            />
          ) : (
            <NavLink className="ais-button background-ais" to="/login">
              {t("login")}
            </NavLink>
          )}
          {fireContext != null && fireContext.isAuthenticated && fireContext.user != null && fireContext.user.isOfficer && (
            <>
              <NavLink className="ais-button background-ais" to="/templates">
                {t("event_templates")}
              </NavLink>
              <NavLink className="ais-button background-ais" to="/createEvent">
                {t("create_event")}
              </NavLink>
            </>
          )}
        </div>
        <div className="language-switcher">
          <select value={i18n.language} onChange={changeLanguage} className="language-select">
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </nav>
      <a className="imgLink" href="/">
        <img src="/images/logo.png" alt="AIS-logo"></img>
      </a>
    </>
  );
}
