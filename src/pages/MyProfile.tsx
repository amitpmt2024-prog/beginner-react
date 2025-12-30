import { useState, useEffect, useCallback } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import AutoBreadcrumb from "../components/AutoBreadcrumb";
import toast from "react-hot-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

interface UserData {
  uid?: string;
  email?: string;
  name?: string;
  accessToken?: string;
  isAnonymous?: boolean;
}

type ProfileFormValues = {
  name: string;
};

// Validation rules
const validationRules = {
  name: {
    required: "Name is required",
  },
};

// Helper function to get user data from localStorage
const getUserDataFromStorage = (): { name: string; email: string } => {
  const userDataString = localStorage.getItem("user");
  if (userDataString) {
    try {
      const userData: UserData = JSON.parse(userDataString);
      return {
        name: userData.name || "jason",
        email: userData.email || "",
      };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return { name: "jason", email: "" };
    }
  }
  return { name: "jason", email: "" };
};

const MyProfile = () => {
  const [email] = useState<string>(() => {
    return getUserDataFromStorage().email;
  });
  const [uid, setUid] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: getUserDataFromStorage().name,
    },
  });

  // Load name from Firebase
  const loadNameFromFirebase = useCallback(async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.name) {
          reset({ name: userData.name });
          const localUserDataString = localStorage.getItem("user");
          if (localUserDataString) {
            try {
              const localUserData: UserData = JSON.parse(localUserDataString);
              const updatedUserData: UserData = {
                ...localUserData,
                name: userData.name,
              };
              localStorage.setItem("user", JSON.stringify(updatedUserData));
            } catch (error) {
              console.error("Error updating localStorage:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading name from Firebase:", error);
    }
  }, [reset]);

  useEffect(() => {
    // Listen to auth state changes to handle anonymous users
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadNameFromFirebase(user.uid);
        
        // Update localStorage with current auth state
        const userDataString = localStorage.getItem("user");
        const userData: UserData = userDataString 
          ? JSON.parse(userDataString)
          : {};
        
        const updatedUserData: UserData = {
          ...userData,
          uid: user.uid,
          email: user.email || userData.email || "",
          isAnonymous: user.isAnonymous,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
    });

    // Also check localStorage for existing data
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData: UserData = JSON.parse(userDataString);
        if (userData.uid) {
          setUid(userData.uid);
          loadNameFromFirebase(userData.uid);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    return () => unsubscribe();
  }, [loadNameFromFirebase]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    let currentUid = uid;

    try {
      // If no UID exists, sign in anonymously for anonymous users
      if (!currentUid) {
        try {
          const anonymousUser = await signInAnonymously(auth);
          currentUid = anonymousUser.user.uid;
          setUid(currentUid);
          
          // Save anonymous user to localStorage
          const anonymousUserData: UserData = {
            uid: currentUid,
            email: "",
            name: data.name,
            isAnonymous: true,
          };
          localStorage.setItem("user", JSON.stringify(anonymousUserData));
          toast.success("Signed in as anonymous user");
        } catch (authError) {
          console.error("Error signing in anonymously:", authError);
          toast.error("Failed to create anonymous session");
          setIsUpdating(false);
          return;
        }
      }

      // Save name to Firebase
      const userRef = doc(db, "users", currentUid);
      await setDoc(
        userRef,
        {
          name: data.name,
          email: email || null,
          uid: currentUid,
          isAnonymous: !email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update localStorage
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        try {
          const userData: UserData = JSON.parse(userDataString);
          const updatedUserData: UserData = {
            ...userData,
            name: data.name,
            uid: currentUid,
          };
          localStorage.setItem("user", JSON.stringify(updatedUserData));
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      } else {
        // Create new localStorage entry if it doesn't exist
        const newUserData: UserData = {
          uid: currentUid,
          email: email || "",
          name: data.name,
          isAnonymous: !email,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));
      }

      toast.success("Name updated successfully");
    } catch (error) {
      console.error("Error updating name in Firebase:", error);
      toast.error("Error updating name in Firebase");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Navbar />
      <AutoBreadcrumb />
      <div className="container py-5">
        <h1 className="text-center mb-4">My Profile</h1>
        <hr />
        <div className="row my-4">
          <div className="col-md-6 col-lg-4 mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="my-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={validationRules.name}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      disabled={isUpdating}
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="name"
                  render={({ message }) => (
                    <p className="errorMessage" style={{ color: "red", marginTop: "5px", fontSize: "14px" }}>
                      {message}
                    </p>
                  )}
                />
              </div>
              <div className="my-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  disabled
                  placeholder="Email address"
                />
              </div>
              <div className="my-3">
                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProfile;