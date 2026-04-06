import { useTranslation } from "react-i18next";
import React from "react";
import { Link } from "react-router-dom";
import { ClubEvent } from "./js/models/clubevent";
import "./css/styles.css";
import "./css/home.css";

const UserHome = () => {
  const { t } = useTranslation();
  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t("ais_events__home")}</title>
      <link rel="icon" href="assets/logo.png" type="image/x-icon" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap"
        rel="stylesheet"
      />
      <nav>
        <button type="button" id="userProfileBtn">
          <img
            className="filter-white"
            src="/assets/user-circle-thin.svg"
            alt={t("user_profile")}
          />
        </button>
        <Link to="/loggedOut" className="signOutBtn">
          Logout
        </Link>
      </nav>
      <Link className="imgLink" to="/">
        <img src="assets/logo.png" alt="Logo" />
      </Link>
      <div id="bodyContainer">
        <div className="eventListContainer">
          <h2>{t("events_attended")}</h2>
          {ClubEvent.map((event) => (
            <div key={event.id} className="eventCard">
              <div className="eventInfo">
                <h3>{event.name}</h3>
                <p>{event.location}</p>
                <p>{event.datetime}</p>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="eventListContainer">
          <h2>{t("upcoming_events")}</h2>
          {ClubEvent.map((event) => (
            <div key={event.id} className="eventCard">
              <div className="eventInfo">
                <h3>{event.name}</h3>
                <p>{event.location}</p>
                <p>{event.datetime}</p>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
