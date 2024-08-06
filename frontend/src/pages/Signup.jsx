import signupImg from "../assets/Images/signup.png"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Sign Up with Awakening Classes for Free 😊"
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup