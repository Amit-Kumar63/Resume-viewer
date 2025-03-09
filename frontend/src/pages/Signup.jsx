import { Link } from "react-router-dom";
import { provider, signInWithPopup, auth, signOut } from "../../firebase.config";
import { toast } from "react-toastify";

const Signup = () => {
    const signup = async (token) => {
        const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/user/signup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const respone = await res.json();
        if (res.status === 200) {
            toast.success("Login successfully");
            localStorage.setItem("ai.hr", respone?.user?.accessToken);
            setTimeout(() => {
                location.replace("/");
            }, 2000);
        } else {
        await signOut(auth)
        toast.error( data.message || 'Login failed. Please try again')
      }
    };

    const signupHandler = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(true);
            signup(token);
        } catch (error) {
            console.error(error.message || "Something went wrong while signup");
        }
    };
    return (
        <div className="bg-black w-full h-screen text-white">
            <div className="bg-gray-900 w-[300px] py-5 mx-auto translate-y-1/2 rounded-md flex flex-col gap-3.5 justify-center items-center">
                <h1 className="text-3xl mb-5 font-semibold">Signup</h1>
                <h4 className="font-semibold text-base">
                    Signup with google account
                </h4>
                <button
                    onClick={signupHandler}
                    className="px-10 bg-gray-600 font-semibold rounded-md hover:rounded-full cursor-pointer">
                    <img
                        src="google.png"
                        alt="google-icon"
                        className="w-30 h-14 object-cover"
                    />
                </button>
                <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-700">
                        login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
