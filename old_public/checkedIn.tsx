import { useTranslation } from "react-i18next";
import React from "react";
import "./css/styles.css";
import "./css/submit_success.css";

function SubmitSuccess() {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t("did_you_bring_a_plus_one_with_you")}</h2>
      <p>{t("select_one_of_the_following_to_comlpete_your_check")}</p>
      <div id="yesNoContainer">
        <a href="userHome.html">Yes</a>
        <a className="no" href="userHome.html">
          No
        </a>
      </div>
    </div>
  );
}

export default SubmitSuccess;
