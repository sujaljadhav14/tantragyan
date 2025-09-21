import React from 'react';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import { getAuth, signInWithPopup, GithubAuthProvider, linkWithCredential, EmailAuthProvider, reauthenticateWithCredential, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { googleProvider } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { googleSignup, emailSignup, githubSignup } from '../../api/axios.api';
import { cn } from "@/lib/utils";
import { useTheme } from "../../components/theme-provider";

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const onGoggleSignUp = async () => {
    try {
      const auth = getAuth();
      
      // Add popup settings
      const settings = {
        popup: true,
        prompt: 'select_account'
      };

      // Try sign in with enhanced error handling
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        console.log("Popup failed, trying redirect...");
        // Fallback to redirect method if popup fails
        await signInWithRedirect(auth, googleProvider);
        result = await getRedirectResult(auth);
      }

      if (!result?.user) {
        throw new Error('No user data returned');
      }

      const user = result.user;
      const auth_token = await user.getIdToken();

      // Verify backend is running before making request
      try {
        const response = await googleSignup(auth_token);

        if (response.success === true) {
          dispatch(login({
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            role: response.user.role,
          }));
          navigate('/dashboard');
        }
      } catch (backendError) {
        console.error("Backend error:", backendError);
        // Show user-friendly error
        alert("Unable to connect to server. Please ensure the backend service is running.");
      }

    } catch (error) {
      console.error("Error during register:", error);
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this website to sign in with Google');
      } else if (error.code === 'auth/cancelled-popup-request') {
        alert('Sign-in was cancelled. Please try again.');
      } else {
        alert('An error occurred during sign in. Please try again.');
      }
    }
  };

  const handleEmailSignUp = async (formData) => {
    try {
      console.log('Attempting signup with data:', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        interests: formData.interests
      });

      const response = await emailSignup(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.password,
        formData.interests
      );

      if (response.success === true) {
        dispatch(login({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: response.user.role || 'student',
        }));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error during email signup:", error);
      // Show user-friendly error message
      if (error.message === "User already registered") {
        throw new Error("This email is already registered. Please try logging in instead.");
      } else {
        throw new Error("Failed to create account. Please try again.");
      }
    }
  };

  const onGithubSignUp = async () => {
    try {
      const auth = getAuth();
      const githubProvider = new GithubAuthProvider();

      // Try signing in with GitHub
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const auth_token = await user.getIdToken();

      const response = await githubSignup(auth_token);

      if (response.success === true) {
        // Check if the user exists in the database
        if (response.user && response.user.role) {
          dispatch(login({
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            role: response.user.role,
          }));
          navigate('/dashboard');
        }
      }
    } catch (error) {
      // General Firebase error
      if (error.code === 'auth/account-exists-with-different-credential') {
        const existingEmail = error.email; // Email that is already registered with a different provider

        // Check for the presence of credential to extract provider information
        const credential = error.credential;
        if (credential) {
          const existingProviderId = credential.providerId; // Get the provider ID from the error

          // Handle different scenarios based on providerId
          if (existingProviderId) {
            const auth = getAuth();
            const user = auth.currentUser;

            try {
              let existingProviderCredential;

              // Handling for Google, Facebook or other providers
              if (existingProviderId === 'google.com') {
                existingProviderCredential = GoogleAuthProvider.credential(error.email);
              } else if (existingProviderId === 'facebook.com') {
                // Handle Facebook login scenario (if required)
              } else {
                // If it's an email/password case
                existingProviderCredential = EmailAuthProvider.credential(existingEmail, 'USER_PASSWORD');
              }

              // Reauthenticate the user with the existing provider's credentials
              await reauthenticateWithCredential(user, existingProviderCredential);

              // Link the GitHub account to the current user
              const githubCredential = GithubAuthProvider.credential(credential.accessToken);
              await linkWithCredential(user, githubCredential);

              console.log('GitHub account successfully linked with the existing account!');

              // Now you can proceed to log the user in
              const auth_token = await user.getIdToken();
              const response = await githubSignup(auth_token);

              if (response.success === true) {
                dispatch(login({
                  name: user.displayName,
                  email: user.email,
                  avatar: user.photoURL,
                  role: response.user.role,
                }));
                navigate('/dashboard');
              }
            } catch (linkError) {
              console.error('Error linking GitHub account:', linkError);
            }
          } else {
            console.error('No provider found for the existing account');
          }
        } else {
          console.error('Credential is missing in the error object');
        }
      } else {
        // Handle other Firebase errors here
        console.error('Error during GitHub signup:', error);
      }
    }
  };


  return (
    <div className={cn(
      "flex flex-col md:flex-row w-full min-h-screen",
      theme === 'dark'
        ? 'bg-[#0A0118]'
        : 'bg-gradient-to-br from-[#6938EF]/5 via-[#9D7BFF]/5 to-[#6938EF]/5'
    )}>
      {/* Left Section */}
      <div className="flex-grow flex justify-center items-center p-6">
        <div className={cn(
          "w-full max-w-[480px] rounded-2xl p-8",
          theme === 'dark'
            ? 'bg-[#110C1D] border border-[#6938EF]/20'
            : 'bg-white border border-border'
        )}>
          <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-[0.02] rounded-2xl"></div>
          <div className="relative z-10">
            <LeftSection />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-grow flex justify-center items-center p-6">
        <RightSection onGoggleSignUp={onGoggleSignUp} onSignUp={handleEmailSignUp} onGithubSignUp={onGithubSignUp} />
      </div>
    </div>
  );
};

export default Layout;
