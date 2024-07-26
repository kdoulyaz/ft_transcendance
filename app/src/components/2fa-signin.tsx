import { Link, useNavigate } from 'react-router-dom';
import { FormEvent, useRef, useState } from 'react';
import axios from 'axios';
const apiUrl = 'http://localhost:3080';

// {
//   headers: {
//     'Content-Type': 'application/json'
//   }
// }
function SignIn2FA() {
  const [validCode, setValidCode] = useState<boolean>(true);
  const verficationCodeRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = verficationCodeRef.current
      ? verficationCodeRef.current.value
      : '';
    void axios
      .post<string>(
        `${apiUrl}/2fa/authenticate`,
        { twoFactorAuthenticationCode: input },
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data === 'invalidCode' || res.data === 'invalidSecret')
          setValidCode(false);
        else {
          setValidCode(true);
          navigate('/home');
        }
      });
  }

  return (
    <div >
        <div className="flex flex-col bg-[#693DCE] text-white h-screen justify-center items-center p-4">
          <h1 className="text-4xl lg:text-6xl md:text-2xl  sm:text-xl text-white mb-4">
            Welcome Back
          </h1>
          <form
            onSubmit={onSubmitHandler}
            className="max-w-md w-full mx-auto overflow-hidden shadow-lg bg-[#2D097F]
            `rounded-2xl p-8 space-y-5"
          >
            <h2 className="text-center text-3xl font-semibold text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-center lg:text-sm md:text-sm text-xs">
              Open the two-step verification app on your mobile device to get
              your verification code.
            </p>
            <input
              placeholder="Authentication Code"
              className={` border placeholder:text-white  bg-[#693DCE] lg:text-sm md:text-sm text-xs
                rounded-lg focus:ring-blue focus:border-blue block p-3 w-full
                ${
                  validCode
                    ? 'border-gray-300 text-white-900'
                    : ' border-red-500 text-red-500'
                }`}
              ref={verficationCodeRef}
              onInput={() => setValidCode(true)}
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#ff7e03] font-poppins text-xl rounded-lg outline-none border-none
                flex justify-center bg-purple-light text-white"
            >
              Authenticate
            </button>
            <span className="block text-center">
              <Link to="/sign-in" className="text-white bg-blue-600 py-2 border font-poppins text-xl px-4 rounded-lg">
                Back to basic login
              </Link>
            </span>
          </form>
        </div>
    </div>
  );
}

export default SignIn2FA;