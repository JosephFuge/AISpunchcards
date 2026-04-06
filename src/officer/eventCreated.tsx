import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./css/styles.css";
import "./css/submit_success.css";

export function EventCreated() {
  const { t } = useTranslation();
  return (
    <div className="center-block">
      <h2>{t("event_created_successfully")}</h2>
      <Link to="/adminHome" className="homeLink">
        Home
      </Link>
    </div>
  );
}
