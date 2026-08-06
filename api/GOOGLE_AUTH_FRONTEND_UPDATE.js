// authAPI.js - Updated Google Login Function

export function googleLogin(accessToken, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Logging in with Google...");
        dispatch(setLoading(true));

        try {
            const response = await apiConnector("POST", GOOGLE_AUTH_API, {
                accessToken: accessToken, // Send as accessToken, not token
            });

            console.log("GOOGLE LOGIN API RESPONSE:", response);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Login Successful");

            // Store token and user data
            dispatch(setToken(response.data.token));
            const userImage = response.data.user?.image
                ? response.data.user.image
                : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;

            dispatch(setUser({ ...response.data.user, image: userImage }));

            // Store in localStorage
            localStorage.setItem("token", JSON.stringify(response.data.token));
            localStorage.setItem("user", JSON.stringify(response.data.user));

            // Navigate to dashboard
            navigate("/dashboard/my-profile");
        } catch (error) {
            console.log("GOOGLE LOGIN API ERROR:", error);
            toast.error(error?.response?.data?.message || "Login Failed");
        } finally {
            dispatch(setLoading(false));
            toast.dismiss(toastId);
        }
    };
}
