import { useTranslation } from "react-i18next";
import { useState, useContext } from "react";
import { AppUser } from "../../models/appuser"; // Adjust the path as necessary
import "../../css/styles.css"; // Adjust the path as necessary
import "../../css/form.css"; // Adjust the path as necessary
import { FirebaseContext } from "../firebaseProvider";
import { getAuth } from "firebase/auth";

export function CreateAccount() {
  const { t } = useTranslation();
  const fireContext = useContext(FirebaseContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    netID: "",
    studentType: "junior", // Default selection, adjust as necessary
    isOfficer: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const auth = getAuth();
      if (auth && auth.currentUser) {
        console.log(`AuthUserId: ${auth.currentUser.uid}`);
        const newUser = new AppUser(
          auth.currentUser.uid, // Assuming Firestore generates the ID
          formData.firstName,
          formData.lastName,
          formData.netID,
          formData.studentType,
          false
        );
        await fireContext?.setNewUser(newUser); // Add the user to the database
      }
      // Optionally clear the form or redirect the user
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{t("create_account")}</h2>
      <div id="titleUnderline"></div>
      <label htmlFor="firstName">{t("first_name")}</label>
      <input
        type="text"
        id="firstName"
        name="firstName"
        onChange={handleChange}
        required
      ></input>
      <label htmlFor="lastName">{t("last_name")}</label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        onChange={handleChange}
        required
      ></input>
      <label htmlFor="netID">{t("net_id")}</label>
      <input
        type="text"
        id="netID"
        name="netID"
        onChange={handleChange}
        required
      ></input>
      <p>{t("student_type")}</p>
      <div className="radioSelector">
        <input
          type="radio"
          id="junior"
          name="studentType"
          value="junior"
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="junior">{t("is_junior_core")}</label>
        <input
          type="radio"
          id="senior"
          name="studentType"
          value="senior"
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="senior">{t("is_senior")}</label>
        <input
          type="radio"
          id="mism"
          name="studentType"
          value="mism"
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="mism">MISM</label>
        <input
          type="radio"
          id="other-byu"
          name="studentType"
          value="other-byu"
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="other-byu">{t("byu_student")}</label>
        <input
          type="radio"
          id="other-guest"
          name="studentType"
          value="other-guest"
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="other-guest">{t("otherguest")}</label>
      </div>
      <button type="submit">{t("create_account")}</button>
    </form>
  );
}
