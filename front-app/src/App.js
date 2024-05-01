import React, { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "./amplifyconfiguration.json";
import LandingPage from "./components/LandingPage";
Amplify.configure(config);

function App({ signOut, user }) {
  // function App() {
  const [accessToken, setAccessToken] = useState(null);
  async function currentSession() {
    try {
      const cognitoTokens = (await fetchAuthSession()).tokens;
      const rawToken = cognitoTokens?.idToken?.toString();
      setAccessToken(rawToken);
    } catch (err) {
      console.log(err);
    }
  }
  currentSession();
  return (
    <>
      {/* <LandingPage /> */}
      <LandingPage accessToken={accessToken} singoutnutton={signOut} />
    </>
  );
}
export default withAuthenticator(App);
// export default App;
