import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Database } from "./path/to/Database"; // Adjust the path as necessary
import { getFirebaseApp } from "./path/to/firebaseConfig"; // Adjust the path as necessary
import { AppUser } from "./path/to/AppUser"; // Adjust the path as necessary
import "./css/styles.css"; // Adjust the path as necessary
import "./css/form.css"; // Adjust the path as necessary

function CreateAccount() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentType: "junior", // Default selection, adjust as necessary
  });

  // Initialize your Firebase and Database instance
  const firebaseApp = getFirebaseApp(); // This should retrieve your Firebase app configuration
  const database = new Database(firebaseApp);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newUser = new AppUser(
        null, // Assuming Firestore generates the ID
        formData.firstName,
        formData.lastName,
        formData.studentType
      );
      await database.addUser(newUser); // Add the user to the database
      alert("Account created successfully!");
      // Optionally clear the form or redirect the user
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account."); // Provide feedback to the user
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t("ais_events__login")}</title>
      <link rel="icon" href="assets/logo.png" type="image/x-icon" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap"
        rel="stylesheet"
      />
      <form onSubmit={handleSubmit}>
        <h2>{t("create_account")}</h2>
        <div id="titleUnderline"></div>
        <label htmlFor="firstName">{t("first_name")}</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <label htmlFor="lastName">{t("last_name")}</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <label htmlFor="studentType">{t("student_type")}</label>
        <select
          id="studentType"
          name="studentType"
          value={formData.studentType}
          onChange={handleChange}
          required
        >
          <option value="junior">{t("is_junior_core")}</option>
          <option value="senior">{t("is_senior")}</option>
          <option value="mism">MISM</option>
          <option value="other-byu">{t("other_byu_student")}</option>
          <option value="other-guest">{t("otherguest")}</option>
        </select>
        <button type="submit">{t("create_account")}</button>
      </form>
    </div>
  );
}

export default CreateAccount;
