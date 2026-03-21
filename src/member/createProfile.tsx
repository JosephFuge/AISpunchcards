import { useTranslation } from "react-i18next";
export function CreateProfile() {
  const { t } = useTranslation();
  return (
    <form id="createAccount">
      <h2>{t("create_account")}</h2>
      <div id="titleUnderline"></div>
      <label htmlFor="firstName">{t("first_name")}</label>
      <input type="text" id="firstName" name="firstName" required></input>
      <label htmlFor="lastName">{t("last_name")}</label>
      <input type="text" id="lastName" name="lastName" required></input>
      <label htmlFor="netID">{t("net_id")}</label>
      <input type="text" id="netID" name="netID" required></input>
      <p>{t("student_type")}</p>
      <div className="radioSelector">
        <input
          type="radio"
          id="junior"
          name="studentType"
          value="junior"
          required
        ></input>
        <label htmlFor="junior">{t("is_junior_core")}</label>
        <input
          type="radio"
          id="senior"
          name="studentType"
          value="senior"
          required
        ></input>
        <label htmlFor="senior">{t("is_senior")}</label>
        <input
          type="radio"
          id="mism"
          name="studentType"
          value="mism"
          required
        ></input>
        <label htmlFor="mism">MISM</label>
        <input
          type="radio"
          id="other-byu"
          name="studentType"
          value="other-byu"
          required
        ></input>
        <label htmlFor="other-byu">{t("byu_student")}</label>
        <input
          type="radio"
          id="other-guest"
          name="studentType"
          value="other-guest"
          required
        ></input>
        <label htmlFor="other-guest">{t("otherguest")}</label>
      </div>
      <button type="submit">{t("create_account")}</button>
    </form>
  );
}
