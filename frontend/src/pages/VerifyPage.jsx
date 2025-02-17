import axios from "axios";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export const VerifyPage = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        axios.defaults.headers = {
          Authorization: "Bearer " + token,
        };
        const response = await axios.get(`http://localhost:8000/verify`);
        setMessage("Email verified successfully!");
      } catch (e) {
        console.log(e);
        setMessage("Verification failed. The link may have expired.");
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div>
      <p>{message}</p>
    </div>
  );
};
