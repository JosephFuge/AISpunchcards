import { useTranslation } from "react-i18next";
import React from "react";
import { ClubEvent } from "./models/clubevents.js";
// import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import "./css/styles.css";
import "./css/home.css";

const AdminHome = () => {
  const { t } = useTranslation();
  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t("ais_events__admin_home")}</title>
      <link rel="icon" href="assets/logo.png" type="image/x-icon" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap"
        rel="stylesheet"
      />
      <nav>
        <Link to="/loggedOut">Logout</Link>
        <Link to="/createEvent">{t("create_event")}</Link>
      </nav>
      <a className="imgLink" href="">
        <img src="assets/logo.png" alt="Logo" />
      </a>
      <div id="bodyContainer">
        <div className="eventListContainer">
          <h2>{t("upcoming_events")}</h2>gtrrr
          {ClubEvent.map((event) => (
            <div key={event.id} className="eventCard">
              <div className="eventInfo">
                <h3>{event.title}</h3>
                <p>{event.location}</p>
                <p>{event.datetime}</p>
                <p>{event.description}</p>
              </div>
              <div className="eventOpen">
                <Link to="/viewEvent">Open</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
