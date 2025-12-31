import { useState, useEffect, useCallback, useRef } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import AutoBreadcrumb from "../components/AutoBreadcrumb";
import toast from "react-hot-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../Firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

interface UserData {
  uid?: string;
  email?: string;
  name?: string;
  photoURL?: string;
  phoneNumber?: string;
  accessToken?: string;
  isAnonymous?: boolean;
}

type ProfileFormValues = {
  name: string;
  photoURL: string;
  phoneNumber: string;
};

// Validation rules
const validationRules = {
  name: {
    required: "Name is required",
  },
  phoneNumber: {
    validate: (value: string) => {
      if (!value || value.trim() === "") {
        return true; // Optional field
      }
      
      // Remove all non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, "");
      
      // Check if it has at least 10 digits (minimum for valid phone numbers)
      if (digitsOnly.length < 10) {
        return "Phone number must contain at least 10 digits";
      }
      
      // Check if it has more than 15 digits (maximum for international numbers)
      if (digitsOnly.length > 15) {
        return "Phone number cannot exceed 15 digits";
      }
      
      // Check if it contains only valid characters (digits, spaces, dashes, plus, parentheses)
      const validPattern = /^[\d\s\-+()]+$/;
      if (!validPattern.test(value)) {
        return "Phone number can only contain digits, spaces, dashes, plus sign, and parentheses";
      }
      
      return true;
    },
  },
};

// Helper function to get user data from localStorage
const getUserDataFromStorage = (): { name: string; email: string; photoURL: string; phoneNumber: string } => {
  const userDataString = localStorage.getItem("user");
  if (userDataString) {
    try {
      const userData: UserData = JSON.parse(userDataString);
      return {
        name: userData.name || "",
        email: userData.email || "",
        photoURL: userData.photoURL || "",
        phoneNumber: userData.phoneNumber || "",
      };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return { name: "", email: "", photoURL: "", phoneNumber: "" };
    }
  }
  return { name: "", email: "", photoURL: "", phoneNumber: "" };
};

const MyProfile = () => {
  const [email] = useState<string>(() => {
    return getUserDataFromStorage().email;
  });
  const [uid, setUid] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: getUserDataFromStorage().name,
      photoURL: getUserDataFromStorage().photoURL,
      phoneNumber: getUserDataFromStorage().phoneNumber,
    },
  });

  // Load user data from Firebase
  const loadUserDataFromFirebase = useCallback(async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const loadedPhotoURL = userData.photoURL || "";
        reset({ 
          name: userData.name || "",
          photoURL: loadedPhotoURL,
          phoneNumber: userData.phoneNumber || "",
        });
        setPreviewImage(loadedPhotoURL);
        
        const localUserDataString = localStorage.getItem("user");
        if (localUserDataString) {
          try {
            const localUserData: UserData = JSON.parse(localUserDataString);
            const updatedUserData: UserData = {
              ...localUserData,
              name: userData.name || localUserData.name,
              photoURL: loadedPhotoURL || localUserData.photoURL || "",
              phoneNumber: userData.phoneNumber || localUserData.phoneNumber || "",
            };
            localStorage.setItem("user", JSON.stringify(updatedUserData));
          } catch (error) {
            console.error("Error updating localStorage:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data from Firebase:", error);
    }
  }, [reset]);

  useEffect(() => {
    // Set initial preview image
    const initialPhotoURL = getUserDataFromStorage().photoURL;
    if (initialPhotoURL) {
      setPreviewImage(initialPhotoURL);
    }

    // Listen to auth state changes to handle anonymous users
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadUserDataFromFirebase(user.uid);
        
        // Update localStorage with current auth state
        const userDataString = localStorage.getItem("user");
        const userData: UserData = userDataString 
          ? JSON.parse(userDataString)
          : {};
        
        const updatedUserData: UserData = {
          ...userData,
          uid: user.uid,
          email: user.email || userData.email || "",
          photoURL: user.photoURL || userData.photoURL || "",
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
          loadUserDataFromFirebase(userData.uid);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    return () => unsubscribe();
  }, [loadUserDataFromFirebase]);

  // Handle file selection and preview
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profile-images/${fileName}`);
      
      setIsUploading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setIsUploading(false);
      
      return downloadURL;
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    let currentUid = uid;
    let finalPhotoURL = data.photoURL;

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

      // Upload image if a new file was selected
      const fileInput = fileInputRef.current;
      if (fileInput?.files && fileInput.files[0]) {
        try {
          finalPhotoURL = await uploadImageToStorage(fileInput.files[0], currentUid);
          setValue("photoURL", finalPhotoURL);
          setPreviewImage(finalPhotoURL);
          toast.success("Image uploaded successfully");
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image. Please try again.");
          setIsUpdating(false);
          return;
        }
      }

      // Save user data to Firebase
      const userRef = doc(db, "users", currentUid);
      await setDoc(
        userRef,
        {
          name: data.name,
          photoURL: finalPhotoURL || null,
          phoneNumber: data.phoneNumber || null,
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
            photoURL: finalPhotoURL || "",
            phoneNumber: data.phoneNumber || "",
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
          photoURL: finalPhotoURL || "",
          phoneNumber: data.phoneNumber || "",
          isAnonymous: !email,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile in Firebase:", error);
      toast.error("Error updating profile in Firebase");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Navbar />
      <AutoBreadcrumb />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">My Profile</h2>
                <hr className="mb-4" />
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Profile Photo Section */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            border: "4px solid #dee2e6",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                          style={{
                            width: "150px",
                            height: "150px",
                            border: "4px solid #dee2e6",
                          }}
                        >
                          <i className="fas fa-user fa-3x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                      disabled={true}
                    />
                    <Controller
                      name="photoURL"
                      control={control}
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />
                  </div>

                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name <span className="text-danger">*</span>
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
                          disabled={isUpdating || isUploading}
                        />
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="name"
                      render={({ message }) => (
                        <p className="text-danger small mt-1 mb-0">{message}</p>
                      )}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="mb-3">
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
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  {/* Phone Number Field */}
                  <div className="mb-4">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number
                    </label>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={validationRules.phoneNumber}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="phoneNumber"
                          type="tel"
                          className="form-control"
                          placeholder="Enter your phone number"
                          disabled={isUpdating || isUploading}
                        />
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="phoneNumber"
                      render={({ message }) => (
                        <p className="text-danger small mt-1 mb-0">{message}</p>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-dark btn-lg"
                      disabled={isUpdating || isUploading}
                    >
                      {isUpdating || isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {isUploading ? "Uploading..." : "Updating..."}
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProfile;
